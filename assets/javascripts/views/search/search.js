import View from '../view';
import SearchScope from './search_scope';
import { App } from '../../app/app';
import { Searcher } from '../../app/searcher';

export default class Search extends View {
  constructor(...args) {
    super(...args);

    this.focus = this.focus.bind(this);
    this.autoFocus = this.autoFocus.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);
    this.onReady = this.onReady.bind(this);
    this.onInput = this.onInput.bind(this);
    this.searchUrl = this.searchUrl.bind(this);
    this.google = this.google.bind(this);
    this.stackoverflow = this.stackoverflow.bind(this);
    this.onResults = this.onResults.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onClick = this.onClick.bind(this);
    this.afterRoute = this.afterRoute.bind(this);

    this.addSubview(this.scope = new SearchScope(this.el));

    this.searcher = new Searcher;
    this.searcher
      .on('results', this.onResults)
      .on('end', this.onEnd);

    App.on('ready', this.onReady);
    $.on(window, 'hashchange', this.searchUrl);
    $.on(window, 'focus', this.onWindowFocus);
  }


  static SEARCH_PARAM = "q";//App.config.search_param;

  static el = '._search';
  static activeClass = '_search-active';

  static elements = {
    input: '._search-input',
    resetLink: '._search-clear'
  };

  static events = {
    input: 'onInput',
    click: 'onClick',
    submit: 'onSubmit'
  };

  static shortcuts = {
    typing: 'focus',
    altG: 'google',
    altS: 'stackoverflow'
  };

  static routes = {
    after: 'afterRoute'
  };

  static HASH_RGX = new RegExp(`^#${Search.SEARCH_PARAM}=(.*)`);


  focus() {
    if (document.activeElement !== this.input) {
      this.input.focus();
    }
  }

  autoFocus() {
    if (!App.isMobile() && !$.isAndroid() && !$.isIOS()) {
      if ((document.activeElement != null ? document.activeElement.tagName : undefined) !== 'INPUT') {
        this.input.focus();
      }
    }
  }

  onWindowFocus(event) {
    if (event.target === window) {
      return this.autoFocus();
    }
  }

  getScopeDoc() {
    if (this.scope.isActive()) {
      return this.scope.getScope();
    }
  }

  reset(force) {
    if (force || !this.input.value) {
      this.scope.reset();
    }
    this.el.reset();
    this.onInput();
    this.autoFocus();
  }

  onReady() {
    this.value = '';
    this.delay(this.onInput);
  }

  onInput() {
    if ((this.value == null) || // ignore events pre-"ready"
      (this.value === this.input.value)) {
      return;
    }
    this.value = this.input.value;

    if (this.value.length) {
      this.search();
    } else {
      this.clear();
    }
  }

  search(url) {
    if (url == null) {
      url = false;
    }
    this.addClass(this.constructor.activeClass);
    this.trigger('searching');

    this.hasResults = null;
    this.flags = {
      urlSearch: url,
      initialResults: true
    };
    this.searcher.find(this.scope.getScope().entries.all(), 'text', this.value);
  }

  searchUrl() {
    let value;
    if (location.pathname === '/') {
      this.scope.searchUrl();
    } else if (!App.router.isIndex()) {
      return;
    }

    if (!(value = this.extractHashValue())) {
      return;
    }
    this.input.value = (this.value = value);
    this.input.setSelectionRange(value.length, value.length);
    this.search(true);
    return true;
  }

  clear() {
    this.removeClass(this.constructor.activeClass);
    this.trigger('clear');
  }

  externalSearch(url) {
    let value;
    if (value = this.value) {
      if (this.scope.name()) {
        value = `${this.scope.name()} ${value}`;
      }
      $.popup(`${url}${encodeURIComponent(value)}`);
      this.reset();
    }
  }

  google() {
    this.externalSearch("https://www.google.com/search?q=");
  }

  stackoverflow() {
    this.externalSearch("https://stackoverflow.com/search?q=");
  }

  onResults(results) {
    if (results.length) {
      this.hasResults = true;
    }
    this.trigger('results', results, this.flags);
    this.flags.initialResults = false;
  }

  onEnd() {
    if (!this.hasResults) {
      this.trigger('noresults');
    }
  }

  onClick(event) {
    if (event.target === this.resetLink) {
      $.stopEvent(event);
      this.reset();
    }
  }

  onSubmit(event) {
    $.stopEvent(event);
  }

  afterRoute(name, context) {
    if ((App.shortcuts.eventInProgress != null ? App.shortcuts.eventInProgress.name : undefined) === 'escape') {
      return;
    }
    if (!context.init && App.router.isIndex()) {
      this.reset(true);
    }
    if (context.hash) {
      this.delay(this.searchUrl);
    }
    $.requestAnimationFrame(this.autoFocus);
  }

  extractHashValue() {
    let value;
    if ((value = this.getHashValue()) != null) {
      App.router.replaceHash();
      return value;
    }
  }

  getHashValue() {
    try {
      let res = HASH_RGX.exec($.urlDecode(location.hash));
      if (res != null) {
        return res[1];
      }
    } catch (error) {}

    return null;
  }
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
