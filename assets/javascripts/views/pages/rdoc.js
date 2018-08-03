import BasePage from './base';

export default class RdocPage extends BasePage {
  static events = {
    click: 'onClick'
  };

  onClick(event) {
    if (!event.target.classList.contains('method-click-advice')) {
      return;
    }
    $.stopEvent(event);

    const source = $('.method-source-code', event.target.parentNode.parentNode);
    const isShown = source.style.display === 'block';

    source.style.display = isShown ? 'none' : 'block';
    return event.target.textContent = isShown ? 'Show source' : 'Hide source';
  }
}
