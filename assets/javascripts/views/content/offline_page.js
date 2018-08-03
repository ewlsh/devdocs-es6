import View from '../view';
import {offlineDoc} from '../../templates/pages/offline_tmpl'

import { offlinePage } from '../../templates/pages/offline_tmpl';
import { offlineError } from '../../templates/error_tmpl';

export default class OfflinePage extends View {
  constructor(...args) {
    super(...args);

    this.onClick = this.onClick.bind(this);
  }

  static className = '_static';

  static events = {
    click: 'onClick',
    change: 'onChange'
  };
  deactivate() {
    if (super.deactivate(...arguments)) {
      this.empty();
    }
  }

  render() {
    if (App.cookieBlocked) {
      this.html(offlineError('cookie_blocked'));
      return;
    }

    App.docs.getInstallStatuses(statuses => {
      if (!this.activated) {
        return;
      }
      if (statuses === false) {
        this.html(offlineError(App.db.reason, App.db.error));
      } else {
        let html = '';
        for (let doc of App.docs.all()) {
          html += this.renderDoc(doc, statuses[doc.slug]);
        }
        this.html(offlinePage(html));
        this.refreshLinks();
      }
    });
  }

  renderDoc(doc, status) {
    return offlineDoc(doc, status);
  }

  getTitle() {
    return 'Offline';
  }

  refreshLinks() {
    for (let action of ['install', 'update', 'uninstall']) {
      this.find(`[data-action-all='${action}']`).classList[this.find(`[data-action='${action}']`) ? 'add' : 'remove']('_show');
    }
  }

  docByEl(el) {
    let slug;
    while (!(slug = el.getAttribute('data-slug'))) {
      el = el.parentNode;
    }
    return App.docs.findBy('slug', slug);
  }

  docEl(doc) {
    return this.find(`[data-slug='${doc.slug}']`);
  }

  onRoute(context) {
    this.render();
  }

  onClick(event) {
    let action;
    let el = $.eventTarget(event);
    if (action = el.getAttribute('data-action')) {
      const doc = this.docByEl(el);
      if (action === 'update') {
        action = 'install';
      }
      doc[action](this.onInstallSuccess.bind(this, doc), this.onInstallError.bind(this, doc), this.onInstallProgress.bind(this, doc));
      el.parentNode.innerHTML = `${el.textContent.replace(/e$/, '')}ing…`;
    } else if (action = el.getAttribute('data-action-all')) {
      App.db.migrate();
      for (el of this.findAll(`[data-action='${action}']`)) {
        $.click(el);
      }
    }
  }

  onInstallSuccess(doc) {
    if (!this.activated) {
      return;
    }
    doc.getInstallStatus(status => {
      let el;
      if (!this.activated) {
        return;
      }
      if (el = this.docEl(doc)) {
        el.outerHTML = this.renderDoc(doc, status);
        $.highlight(el, {
          className: '_highlight'
        });
        this.refreshLinks();
      }
    });
  }

  onInstallError(doc) {
    let el;
    if (!this.activated) {
      return;
    }
    if (el = this.docEl(doc)) {
      el.lastElementChild.textContent = 'Error';
    }
  }

  onInstallProgress(doc, event) {
    let el;
    if (!this.activated || !event.lengthComputable) {
      return;
    }
    if (el = this.docEl(doc)) {
      const percentage = Math.round((event.loaded * 100) / event.total);
      el.lastElementChild.textContent = el.lastElementChild.textContent.replace(/(\s.+)?$/, ` (${percentage}%)`);
    }
  }

  onChange(event) {
    if (event.target.name === 'autoUpdate') {
      App.settings.set('manualUpdate', !event.target.checked);
    }
  }
}
