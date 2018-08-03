import View from '../view';

import Util from '../../lib/util';

Util();

export default class Notif extends View {
  static className = '_notif';
  static activeClass = '_in';
  static attributes = {
    role: 'alert'
  };

  static defautOptions = {
    autoHide: 15000
  };

  static events = {
    click: 'onClick'
  };

  constructor(type, options) {
    super(...arguments);

    this.onClick = this.onClick.bind(this);
    this.type = type;

    if (options == null) {
      options = {};
    }

    this.options = options;
    this.options = $.extend({}, this.constructor.defautOptions, this.options);
  }

  show() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = this.delay(this.hide, this.options.autoHide);
    } else {
      this.render();
      this.position();
      this.activate();
      this.appendTo(document.body);
      this.el.offsetWidth; // force reflow
      this.addClass(this.constructor.activeClass);
      if (this.options.autoHide) {
        this.timeout = this.delay(this.hide, this.options.autoHide);
      }
    }
  }

  hide() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.detach();
  }

  render() {
    this.html(this.tmpl(`notif${this.type}`));
  }

  position() {
    const notifications = $$(`.${Notif.className}`);
    if (notifications.length) {
      const lastNotif = notifications[notifications.length - 1];
      this.el.style.top = lastNotif.offsetTop + lastNotif.offsetHeight + 16 + 'px';
    }
  }

  onClick(event) {
    if (event.which !== 1) {
      return;
    }
    const target = $.eventTarget(event);
    if (target.hasAttribute('data-behavior')) {
      return;
    }
    if ((target.tagName !== 'A') || target.classList.contains('_notif-close')) {
      $.stopEvent(event);
      this.hide();
    }
  }
}