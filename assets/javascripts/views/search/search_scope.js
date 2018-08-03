import View from '../view';
import {
  App
} from '../../app/app';

import {
  SynchronousSearcher
} from '../../app/searcher';

console.log(JSON.stringify(App));

export default class SearchScope extends View {

  static SEARCH_PARAM = "q"; //TODO App.config.search_param;

  static elements = {
    input: '._search-input',
    tag: '._search-tag'
  };

  static events = {
    keydown: 'onKeydown'
  };

  static routes = {
    after: 'afterRoute'
  };

  static HASH_RGX = new RegExp(`^#${SearchScope.SEARCH_PARAM}=(.+?) .`);


  constructor(el) {
    super(...arguments);

    this.onResults = this.onResults.bind(this);
    this.reset = this.reset.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.afterRoute = this.afterRoute.bind(this);
    this.el = el;

    this.refreshElements();

    if (this.input) {
      this.placeholder = this.input.getAttribute('placeholder');
    }

    this.searcher = new SynchronousSearcher({
      fuzzy_min_length: 2,
      max_results: 1
    });
    this.searcher.on('results', this.onResults);
  }

  getScope() {
    return this.doc || app;
  }

  isActive() {
    return !!this.doc;
  }

  name() {
    return (this.doc != null ? this.doc.name : undefined);
  }

  search(value, searchDisabled) {
    if (searchDisabled == null) {
      searchDisabled = false;
    }
    if (this.doc) {
      return;
    }
    this.searcher.find(App.docs.all(), 'text', value);
    if (!this.doc && searchDisabled) {
      this.searcher.find(App.disabledDocs.all(), 'text', value);
    }
  }

  searchUrl() {
    let value;
    if (value = this.extractHashValue()) {
      this.search(value, true);
    }
  }

  onResults(results) {
    let doc;
    if (!(doc = results[0])) {
      return;
    }
    if (App.docs.contains(doc)) {
      this.selectDoc(doc);
    } else {
      this.redirectToDoc(doc);
    }
  }

  selectDoc(doc) {
    const previousDoc = this.doc;
    if (doc === previousDoc) {
      return;
    }
    this.doc = doc;

    this.tag.textContent = doc.fullName;
    this.tag.style.display = 'block';

    this.input.removeAttribute('placeholder');
    this.input.value = this.input.value.slice(this.input.selectionStart);
    this.input.style.paddingLeft = this.tag.offsetWidth + 10 + 'px';

    $.trigger(this.input, 'input');
    this.trigger('change', this.doc, previousDoc);
  }

  redirectToDoc(doc) {
    const {
      hash
    } = location;
    App.router.replaceHash('');
    location.assign(doc.fullPath() + hash);
  }

  reset() {
    if (!this.doc) {
      return;
    }
    const previousDoc = this.doc;
    this.doc = null;

    this.tag.textContent = '';
    this.tag.style.display = 'none';

    this.input.setAttribute('placeholder', this.placeholder);
    this.input.style.paddingLeft = '';

    this.trigger('change', null, previousDoc);
  }

  onKeydown(event) {
    if (event.which === 8) { // backspace
      if (this.doc && !this.input.value) {
        $.stopEvent(event);
        this.reset();
      }
    } else if (!this.doc && this.input.value) {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }
      if ((event.which === 9) || // tab
        ((event.which === 32) && App.isMobile())) { // space
        this.search(this.input.value.slice(0, this.input.selectionStart));
        if (this.doc) {
          $.stopEvent(event);
        }
      }
    }
  }

  extractHashValue() {
    let value;
    if (value = this.getHashValue()) {
      const newHash = $.urlDecode(location.hash).replace(`#${SearchScope.SEARCH_PARAM}=${value} `, `#${SearchScope.SEARCH_PARAM}=`);
      App.router.replaceHash(newHash);
      return value;
    }
  }

  getHashValue() {
    try {
      let res = HASH_RGX.exec($.urlDecode(location.hash));

      if (res != null) {
        return res[1];
      }
    } catch (error) {}

    return null;
  }

  afterRoute(name, context) {
    if (!App.isSingleDoc() && context.init && context.doc) {
      this.selectDoc(context.doc);
    }
  }
}
