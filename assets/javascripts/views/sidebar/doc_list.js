import View from '../view'
import ListFocus from '../list/list_focus';
import ListFold from '../list/list_fold';
import ListSelect from '../list/list_select';
import EntryList from './entry_list';
import TypeList from './type_list';
import { App } from '../../app/app';

export default class DocList extends View {
  constructor(...args) {
    super(...args);

    this.render = this.render.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onEnabled = this.onEnabled.bind(this);
    this.afterRoute = this.afterRoute.bind(this);

    this.lists = {};

    this.addSubview(this.listFocus = new ListFocus(this.el));
    this.addSubview(this.listFold = new ListFold(this.el));
    this.addSubview(this.listSelect = new ListSelect(this.el));

    App.on('ready', this.render);
  }

  static className = '_list';
  static attributes = {
    role: 'navigation'
  };

  static events = {
    open: 'onOpen',
    close: 'onClose',
    click: 'onClick'
  };

  static routes = {
    after: 'afterRoute'
  };

  static elements = {
    disabledTitle: '._list-title',
    disabledList: '._disabled-list'
  };



  activate() {
    if (super.activate(...arguments)) {
      for (let slug in this.lists) {
        const list = this.lists[slug];
        list.activate();
      }
      this.listSelect.selectCurrent();
    }
  }

  deactivate() {
    if (super.deactivate(...arguments)) {
      for (let slug in this.lists) {
        const list = this.lists[slug];
        list.deactivate();
      }
    }
  }

  render() {
    let html = '';
    for (let doc of App.docs.all()) {
      html += this.tmpl('sidebarDoc', doc, {
        fullName: App.docs.countAllBy('name', doc.name) > 1
      });
    }
    this.html(html);
    if (!App.isSingleDoc() && (App.disabledDocs.size() !== 0)) {
      this.renderDisabled();
    }
  }

  renderDisabled() {
    this.append(this.tmpl('sidebarDisabled', {
      count: App.disabledDocs.size()
    }));
    this.refreshElements();
    this.renderDisabledList();
  }

  renderDisabledList() {
    if (App.settings.get('hideDisabled')) {
      this.removeDisabledList();
    } else {
      this.appendDisabledList();
    }
  }

  appendDisabledList() {
    let doc;
    let html = '';
    const docs = [].concat(...(App.disabledDocs.all() || []));

    while ((doc = docs.shift())) {
      if (doc.version != null) {
        let versions = '';
        while (true) {
          versions += this.tmpl('sidebarDoc', doc, {
            disabled: true
          });
          if ((docs[0] != null ? docs[0].name : undefined) !== doc.name) {
            break;
          }
          doc = docs.shift();
        }
        html += this.tmpl('sidebarDisabledVersionedDoc', doc, versions);
      } else {
        html += this.tmpl('sidebarDoc', doc, {
          disabled: true
        });
      }
    }

    this.append(this.tmpl('sidebarDisabledList', html));
    this.disabledTitle.classList.add('open-title');
    this.refreshElements();
  }

  removeDisabledList() {
    if (this.disabledList) {
      $.remove(this.disabledList);
    }
    this.disabledTitle.classList.remove('open-title');
    this.refreshElements();
  }

  reset(options) {
    if (options == null) {
      options = {};
    }
    this.listSelect.deselect();
    if (this.listFocus != null) {
      this.listFocus.blur();
    }
    this.listFold.reset();
    if (options.revealCurrent || App.isSingleDoc()) {
      this.revealCurrent();
    }
  }

  onOpen(event) {
    $.stopEvent(event);
    const doc = App.docs.findBy('slug', event.target.getAttribute('data-slug'));

    if (doc && !this.lists[doc.slug]) {
      this.lists[doc.slug] = doc.types.isEmpty() ?
        new EntryList(doc.entries.all()) :
        new TypeList(doc);
      $.after(event.target, this.lists[doc.slug].el);
    }
  }

  onClose(event) {
    $.stopEvent(event);
    const doc = App.docs.findBy('slug', event.target.getAttribute('data-slug'));

    if (doc && this.lists[doc.slug]) {
      this.lists[doc.slug].detach();
      delete this.lists[doc.slug];
    }
  }

  select(model) {
    this.listSelect.selectByHref(model != null ? model.fullPath() : undefined);
  }

  reveal(model) {
    this.openDoc(model.doc);
    if (model.type) {
      this.openType(model.getType());
    }
    this.focus(model);
    this.paginateTo(model);
    this.scrollTo(model);
  }

  focus(model) {
    if (this.listFocus != null) {
      this.listFocus.focus(this.find(`a[href='${model.fullPath()}']`));
    }
  }

  revealCurrent() {
    let model;
    if (model = App.router.context.type || App.router.context.entry) {
      this.reveal(model);
      this.select(model);
    }
  }

  openDoc(doc) {
    if (App.disabledDocs.contains(doc) && doc.version) {
      this.listFold.open(this.find(`[data-slug='${doc.slug_without_version}']`));
    }
    this.listFold.open(this.find(`[data-slug='${doc.slug}']`));
  }

  closeDoc(doc) {
    this.listFold.close(this.find(`[data-slug='${doc.slug}']`));
  }

  openType(type) {
    this.listFold.open(this.lists[type.doc.slug].find(`[data-slug='${type.slug}']`));
  }

  paginateTo(model) {
    if (this.lists[model.doc.slug] != null) {
      this.lists[model.doc.slug].paginateTo(model);
    }
  }

  scrollTo(model) {
    $.scrollTo(this.find(`a[href='${model.fullPath()}']`), null, 'top', {
      margin: App.isMobile() ? 48 : 0
    });
  }

  toggleDisabled() {
    if (this.disabledTitle.classList.contains('open-title')) {
      this.removeDisabledList();
      App.settings.set('hideDisabled', true);
    } else {
      this.appendDisabledList();
      App.settings.set('hideDisabled', false);
    }
  }

  onClick(event) {
    let slug;
    const target = $.eventTarget(event);
    if (this.disabledTitle && $.hasChild(this.disabledTitle, target) && (target.tagName !== 'A')) {
      $.stopEvent(event);
      this.toggleDisabled();
    } else if (slug = target.getAttribute('data-enable')) {
      $.stopEvent(event);
      const doc = App.disabledDocs.findBy('slug', slug);
      if (doc) {
        App.enableDoc(doc, this.onEnabled, this.onEnabled);
      }
    }
  }

  onEnabled() {
    this.reset();
    this.render();
  }

  afterRoute(route, context) {
    if (context.init) {
      if (this.activated) {
        this.reset({
          revealCurrent: true
        });
      }
    } else {
      this.select(context.type || context.entry);
    }
  }
}
