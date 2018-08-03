import View from '../view';
import Mobile from './mobile';
import Settings from './settings';
import Menu from './menu';
import Sidebar from '../sidebar/sidebar';
import Resizer from './resizer';
import Content from '../content/content';
import Path from './path';
import {
  App
} from '../../app/app';

export default class Document extends View {
  constructor(...args) {
    super(...args);

    this.afterRoute = this.afterRoute.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

  }

  init() {
    this.addSubview((this.menu = new Menu),
      this.addSubview(this.sidebar = new Sidebar()));

    if (Resizer.isSupported()) {
      this.addSubview(this.resizer = new Resizer());
    }

    this.addSubview(this.content = new Content());

    if (!App.isSingleDoc() && !App.isMobile()) {
      this.addSubview(this.path = new Path());
    }

    if (!App.isSingleDoc()) {
      this.settings = new Settings;
    }

    $.on(document.body, 'click', this.onClick);
  }


  static el = document;

  static events = {
    visibilitychange: 'onVisibilityChange'
  };

  static shortcuts = {
    help: 'onHelp',
    preferences: 'onPreferences',
    escape: 'onEscape',
    superLeft: 'onBack',
    superRight: 'onForward'
  };

  static routes = {
    after: 'afterRoute'
  };


  setTitle(title) {
    return this.el.title = title ? `${title} — DevDocs` : 'DevDocs API Documentation';
  }

  afterRoute(route) {
    if (route === 'settings') {
      if (this.settings != null) {
        this.settings.activate();
      }
    } else {
      if (this.settings != null) {
        this.settings.deactivate();
      }
    }
  }

  onVisibilityChange() {
    if (this.el.visibilityState !== 'visible') {
      return;
    }
    this.delay(function () {
      if (App.isMobile() !== Mobile.detect()) {
        location.reload();
      }
    }, 300);
  }

  onHelp() {
    App.router.show('/help#shortcuts');
  }

  onPreferences() {
    App.router.show('/settings');
  }

  onEscape() {
    const path = !App.isSingleDoc() || (location.pathname === App.doc.fullPath()) ?
      '/' :
      App.doc.fullPath();

    App.router.show(path);
  }

  onBack() {
    history.back();
  }

  onForward() {
    history.forward();
  }

  onClick(event) {
    const target = $.eventTarget(event);
    if (!target.hasAttribute('data-behavior')) {
      return;
    }
    $.stopEvent(event);
    switch (target.getAttribute('data-behavior')) {
      case 'back':
        history.back();
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'reboot':
        window.location = '/';
        break;
      case 'hard-reload':
        App.reload();
        break;
      case 'reset':
        if (confirm('Are you sure you want to reset DevDocs?')) {
          App.reset();
        }
        break;
    }
  }
}
