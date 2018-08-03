import View from '../view'
import ListFold from '../list/list_fold';

export default class DocPicker extends View {
  constructor(...args) {
    super(...args);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onDOMFocus = this.onDOMFocus.bind(this);

    this.addSubview(this.listFold = new ListFold(this.el));
  }


  static className = '_list _list-picker';

  static events = {
    mousedown: 'onMouseDown',
    mouseup: 'onMouseUp'
  };


  activate() {
    if (super.activate(...arguments)) {
      this.render();
      $.on(this.el, 'focus', this.onDOMFocus, true);
    }
  }

  deactivate() {
    if (super.deactivate(...arguments)) {
      this.empty();
      $.off(this.el, 'focus', this.onDOMFocus, true);
      this.focusEl = null;
    }
  }

  render() {
    let doc;
    let html = this.tmpl('docPickerHeader');
    let docs = App.docs.all().concat(...Array.from(App.disabledDocs.all() || []));

    while ((doc = docs.shift())) {
      if (doc.version != null) {
        let versions;
        [docs, versions] = Array.from(this.extractVersions(docs, doc));
        html += this.tmpl('sidebarVersionedDoc', doc, this.renderVersions(versions), {
          open: App.docs.contains(doc)
        });
      } else {
        html += this.tmpl('sidebarLabel', doc, {
          checked: App.docs.contains(doc)
        });
      }
    }

    this.html(html + this.tmpl('docPickerNote'));
    const inputTags = this.findByTag('input');

    if (inputTags) {
      $.requestAnimationFrame(() => {
        inputTags.focus();
      });
    }
  }

  renderVersions(docs) {
    let html = '';
    for (let doc of docs) {
      html += this.tmpl('sidebarLabel', doc, {
        checked: App.docs.contains(doc)
      });
    }
    return html;
  }

  extractVersions(originalDocs, version) {
    const docs = [];
    const versions = [version];
    for (let doc of Array.from(originalDocs)) {
      (doc.name === version.name ? versions : docs).push(doc);
    }
    return [docs, versions];
  }

  empty() {
    this.resetClass();
    super.empty(...arguments);
  }

  getSelectedDocs() {
    return Array.from(this.findAllByTag('input')).filter((input) => (input != null ? input.checked : undefined)).map((input) =>
      input.name);
  }

  onMouseDown() {
    this.mouseDown = Date.now();
  }

  onMouseUp() {
    this.mouseUp = Date.now();
  }

  onDOMFocus(event) {
    const {
      target
    } = event;
    if (target.tagName === 'INPUT') {
      if ((!this.mouseDown || !(Date.now() < (this.mouseDown + 100))) && (!this.mouseUp || !(Date.now() < (this.mouseUp + 100)))) {
        $.scrollTo(target.parentNode, null, 'continuous');
      }
    } else if (target.classList.contains(ListFold.targetClass)) {
      target.blur();
      if (!this.mouseDown || !(Date.now() < (this.mouseDown + 100))) {
        if (this.focusEl === $('input', target.nextElementSibling)) {
          if (target.classList.contains(ListFold.activeClass)) {
            this.listFold.close(target);
          }
          let prev = target.previousElementSibling;
          while ((prev.tagName !== 'LABEL') && !prev.classList.contains(ListFold.targetClass)) {
            prev = prev.previousElementSibling;
          }
          if (prev.classList.contains(ListFold.activeClass)) {
            prev = $.makeArray($$('input', prev.nextElementSibling)).pop();
          }
          this.delay(() => prev.focus());
        } else {
          if (!target.classList.contains(ListFold.activeClass)) {
            this.listFold.open(target);
          }
          this.delay(() => $('input', target.nextElementSibling).focus());
        }
      }
    }
    this.focusEl = target;
  }
}