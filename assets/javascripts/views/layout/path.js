import View from '../view';
import { App } from '../../app/app'

import { path } from '../../templates/path_tmpl';

export default class Path extends View {
  constructor(...args) {
    super(...args);

    this.onClick = this.onClick.bind(this);
    this.afterRoute = this.afterRoute.bind(this);
  }

  static className = '_path';
  static attributes = {
    role: 'complementary'
  };

  static events = {
    click: 'onClick'
  };

  static routes = {
    after: 'afterRoute'
  };

  render(...args) {
    this.html(path(...args));
    this.show();
  }

  show() {
    if (!this.el.parentNode) {
      this.prependTo(App.constructor.el);
    }
  }

  hide() {
    if (this.el.parentNode) {
      $.remove(this.el);
    }
  }

  onClick(event) {
    let link;
    if (link = $.closestLink(event.target, this.el)) {
      this.clicked = true;
    }
  }

  afterRoute(route, context) {
    if (context.type) {
      this.render(context.doc, context.type);
    } else if (context.entry) {
      if (context.entry.isIndex()) {
        this.render(context.doc);
      } else {
        this.render(context.doc, context.entry.getType(), context.entry);
      }
    } else {
      this.hide();
    }

    if (this.clicked) {
      this.clicked = null;
      App.document.sidebar.reset();
    }
  }
}
