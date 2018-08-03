import View from '../view';
import { App } from '../../app/app';

import HiddenPage from '../pages/hidden';
import BasePage from '../pages/base'

export default class EntryPage extends View {
  constructor(...args) {
    super(...args);

    this.beforeRoute = this.beforeRoute.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onAltO = this.onAltO.bind(this);

    this.cacheMap = {};
    this.cacheStack = [];
  }

  static className = '_page';
  static errorClass = '_page-error';

  static events = {
    click: 'onClick'
  };

  static shortcuts = {
    altO: 'onAltO'
  };

  static routes = {
    before: 'beforeRoute'
  };

  static LINKS = {
    home: 'Homepage',
    code: 'Source code'
  };


  deactivate() {
    if (super.deactivate(...arguments)) {
      this.empty();
      this.entry = null;
    }
  }

  loading() {
    this.empty();
    this.trigger('loading');
  }

  render(content, fromCache) {
    if (content == null) {
      content = '';
    }
    if (fromCache == null) {
      fromCache = false;
    }
    if (!this.activated) {
      return;
    }
    this.empty();
    this.subview = new(this.subViewClass())(this.el, this.entry);

    $.batchUpdate(this.el, () => {
      this.subview.render(content, fromCache);
      if (!fromCache) {
        this.addCopyButtons();
      }
    });

    if (App.disabledDocs.findBy('slug', this.entry.doc.slug)) {
      this.hiddenView = new HiddenPage(this.el, this.entry);
    }

    this.delay(this.polyfillMathML);
    this.trigger('loaded');
  }

  addCopyButtons() {
    if (!this.copyButton) {
      this.copyButton = document.createElement('button');
      this.copyButton.innerHTML = '<svg><use xlink:href="#icon-copy"/></svg>';
      this.copyButton.type = 'button';
      this.copyButton.className = '_pre-clip';
      this.copyButton.title = 'Copy to clipboard';
      this.copyButton.setAttribute('aria-label', 'Copy to clipboard');
    }
    for (let el of this.findAllByTag('pre')) {
      el.appendChild(this.copyButton.cloneNode(true));
    }
  }

  polyfillMathML() {
    if ((window.supportsMathML !== false) || !!this.polyfilledMathML || !this.findByTag('math')) {
      return;
    }
    this.polyfilledMathML = true;
    $.append(document.head, `<link rel="stylesheet" href="${App.config.mathml_stylesheet}">`);
  }

  prepareContent(content) {
    if (!this.entry.isIndex() || !this.entry.doc.links) {
      return content;
    }

    const links = (() => {
      const result = [];
      for (let link in this.entry.doc.links) {
        const url = this.entry.doc.links[link];
        result.push(`<a href="${url}" class="_links-link">${LINKS[link]}</a>`);
      }
      return result;
    })();

    return `<p class="_links">${links.join('')}</p>${content}`;
  }

  empty() {
    if (this.subview != null) {
      this.subview.deactivate();
    }
    this.subview = null;

    if (this.hiddenView != null) {
      this.hiddenView.deactivate();
    }
    this.hiddenView = null;

    this.resetClass();
    super.empty(...arguments);
  }

  subViewClass() {
    return App.views[`${$.classify(this.entry.doc.type)}Page`] || BasePage;
  }

  getTitle() {
    return this.entry.doc.fullName + (this.entry.isIndex() ? ' documentation' : ` / ${this.entry.name}`);
  }

  beforeRoute() {
    this.cache();
    this.abort();
  }

  onRoute(context) {
    const isSameFile = context.entry.filePath() === (this.entry != null ? this.entry.filePath() : undefined);
    this.entry = context.entry;
    if (!isSameFile) {
      this.restore() || this.load();
    }
  }

  load() {
    this.loading();
    this.xhr = this.entry.loadFile(this.onSuccess, this.onError);
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = (this.entry = null);
    }
  }

  onSuccess(response) {
    if (!this.activated) {
      return;
    }
    this.xhr = null;
    this.render(this.prepareContent(response));
  }

  onError() {
    this.xhr = null;
    this.render(this.tmpl('pageLoadError'));
    this.resetClass();
    this.addClass(this.constructor.errorClass);
    if (App.appCache != null) {
      App.appCache.update();
    }
  }

  cache() {
    let path;
    if (this.xhr || !this.entry || this.cacheMap[(path = this.entry.filePath())]) {
      return;
    }

    this.cacheMap[path] = this.el.innerHTML;
    this.cacheStack.push(path);

    while (this.cacheStack.length > App.config.history_cache_size) {
      delete this.cacheMap[this.cacheStack.shift()];
    }
  }

  restore() {
    let path;
    if (this.cacheMap[(path = this.entry.filePath())]) {
      this.render(this.cacheMap[path], true);
      return true;
    }
  }

  onClick(event) {
    const target = $.eventTarget(event);
    if (target.hasAttribute('data-retry')) {
      $.stopEvent(event);
      this.load();
    } else if (target.classList.contains('_pre-clip')) {
      $.stopEvent(event);
      target.classList.add($.copyToClipboard(target.parentNode.textContent) ? '_pre-clip-success' : '_pre-clip-error');
      setTimeout((() => target.className = '_pre-clip'), 2000);
    }
  }

  onAltO() {
    let link;
    if (!(link = this.find('._attribution:last-child ._attribution-link'))) {
      return;
    }
    this.delay(() => $.popup(link.href + location.hash));
  }
}
