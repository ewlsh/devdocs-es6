import View from '../view';

import {
  typePage
} from '../../templates/pages/type_tmpl';

export default class TypePage extends View {

  static className = '_page';

  deactivate() {
    if (super.deactivate(...arguments)) {
      this.empty();
      this.type = null;
    }
  }

  render(type) {
    this.type = type;
    this.html(typePage(this.type));
  }

  getTitle() {
    return `${this.type.doc.fullName} / ${this.type.name}`;
  }

  onRoute(context) {
    this.render(context.type);
  }
}
