import BasePage from './base';


export default class SqlitePage extends BasePage {
  constructor(...args) {
    super(...args);

    this.onClick = this.onClick.bind(this);
  }

  static events = {
    click: 'onClick'
  };

  onClick(event) {
    let el, id;
    if (!(id = event.target.getAttribute('data-toggle'))) {
      return;
    }
    if (!(el = this.find(`#${id}`))) {
      return;
    }
    $.stopEvent(event);
    if (el.style.display === 'none') {
      el.style.display = 'block';
      event.target.textContent = 'hide';
    } else {
      el.style.display = 'none';
      event.target.textContent = 'show';
    }
  }
}
