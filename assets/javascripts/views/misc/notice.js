import View from '../view';
import { App } from '../../app/app';

export default class Notice extends View {

  static className = '_notice';
  static attributes = {
    role: 'alert'
  };

  constructor(type, ...rest) {
    super(...arguments);

    this.type = type;
    [...this.args] = rest;

    this.activate();
  }

  activate() {
    if (super.activate(...arguments)) {
      this.show();
    }
  }

  deactivate() {
    if (super.deactivate(...arguments)) {
      this.hide();
    }
  }

  show() {
    this.html(this.tmpl(`${this.type}Notice`, ...this.args));
    this.prependTo(App.constructor.el);
  }

  hide() {
    $.remove(this.el);
  }
}
