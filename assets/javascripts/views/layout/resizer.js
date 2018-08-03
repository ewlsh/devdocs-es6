import View from '../view';
import { App } from '../../app/app';

import Util from '../../lib/util';
Util();

export default class Resizer extends View {
  constructor(...args) {
    super(...args);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.el.setAttribute('draggable', 'true');
    this.appendTo($('._app'));

    this.style = $('style[data-resizer]');
    this.size = this.style.getAttribute('data-size');
  }

  static className = '_resizer';

  static events = {
    dragstart: 'onDragStart',
    dragend: 'onDragEnd'
  };

  static MIN = 260;
  static MAX = 600;

  static isSupported() {
    return 'ondragstart' in document.createElement('div') && !App.isMobile();
  }

  resize(value, save) {
    value -= App.constructor.el.offsetLeft;
    if (!(value > 0)) {
      return;
    }
    value = Math.min(Math.max(Math.round(value), MIN), MAX);
    const newSize = `${value}px`;
    this.style.innerHTML = this.style.innerHTML.replace(new RegExp(this.size, 'g'), newSize);
    this.size = newSize;
    if (save) {
      App.settings.setSize(value);
      if (App.appCache != null) {
        App.appCache.updateInBackground();
      }
    }
  }

  onDragStart(event) {
    this.style.removeAttribute('disabled');
    event.dataTransfer.effectAllowed = 'link';
    event.dataTransfer.setData('Text', '');
    $.on(window, 'dragover', this.onDrag);
  }

  onDrag(event) {
    const value = event.pageX;
    if (!(value > 0)) {
      return;
    }
    this.lastDragValue = value;
    if (this.lastDrag && (this.lastDrag > (Date.now() - 50))) {
      return;
    }
    this.lastDrag = Date.now();
    this.resize(value, false);
  }

  onDragEnd(event) {
    $.off(window, 'dragover', this.onDrag);
    let value = event.pageX || (event.screenX - window.screenX);
    if (this.lastDragValue && !(this.lastDragValue - 5 < value && value < this.lastDragValue + 5)) { // https://github.com/freeCodeCamp/devdocs/issues/265
      value = this.lastDragValue;
    }
    this.resize(value, true);
  }
}
