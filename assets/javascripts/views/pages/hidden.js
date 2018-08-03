import View from '../view';
import Notice from '../misc/notice'

export default class HiddenPage extends View {
  static events = {
    click: 'onClick'
  };

  constructor(el, entry) {
    super(...arguments);

    this.onClick = this.onClick.bind(this);
    this.el = el;
    this.entry = entry;

    this.addSubview(this.notice = new Notice('disabledDoc'));
    this.activate();
  }

  onClick(event) {
    let link;
    if (link = $.closestLink(event.target, this.el)) {
      $.stopEvent(event);
      $.popup(link);
    }
  }
}
