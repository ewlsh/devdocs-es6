import View from '../view';
import Docs from '../../collections/docs';
import DocPicker from '../sidebar/doc_picker';
import {
  App
} from '../../app/app';

export default class Settings extends View {
  constructor(...args) {
    super(...args);

    this.onChange = this.onChange.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onImport = this.onImport.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onAppCacheProgress = this.onAppCacheProgress.bind(this);

    this.addSubview(this.docPicker = new DocPicker());
  }


  static SIDEBAR_HIDDEN_LAYOUT = '_sidebar-hidden';

  static el = '._settings';

  static elements = {
    sidebar: '._sidebar',
    saveBtn: 'button[type="submit"]',
    backBtn: 'button[data-back]'
  };

  static events = {
    import: 'onImport',
    change: 'onChange',
    submit: 'onSubmit',
    click: 'onClick'
  };

  static shortcuts = {
    enter: 'onEnter'
  };


  activate() {
    if (super.activate(...arguments)) {
      this.render();
      document.body.classList.remove(SIDEBAR_HIDDEN_LAYOUT);
      if (App.appCache != null) {
        App.appCache.on('progress', this.onAppCacheProgress);
      }
    }
  }

  deactivate() {
    if (super.deactivate(...arguments)) {
      this.resetClass();
      this.docPicker.detach();
      if (App.settings.hasLayout(SIDEBAR_HIDDEN_LAYOUT)) {
        document.body.classList.add(SIDEBAR_HIDDEN_LAYOUT);
      }
      if (App.appCache != null) {
        App.appCache.off('progress', this.onAppCacheProgress);
      }
    }
  }

  render() {
    this.docPicker.appendTo(this.sidebar);
    this.refreshElements();
    this.addClass('_in');
  }

  save(options) {
    if (options == null) {
      options = {};
    }
    if (!this.saving) {
      let docs;
      this.saving = true;

      if (options.import) {
        docs = App.settings.getDocs();
      } else {
        docs = this.docPicker.getSelectedDocs();
        App.settings.setDocs(docs);
      }

      this.saveBtn.textContent = App.appCache ? 'Downloading\u2026' : 'Saving\u2026';
      const disabledDocs = new Docs((() => {
        const result = [];
        for (let doc of App.docs.all()) {
          if (docs.indexOf(doc.slug) === -1) {
            result.push(doc);
          }
        }
        return result;
      })());
      disabledDocs.uninstall(function () {
        App.db.migrate();
        return App.reload();
      });
    }
  }

  onChange() {
    this.addClass('_dirty');
  }

  onEnter() {
    this.save();
  }

  onSubmit(event) {
    event.preventDefault();
    this.save();
  }

  onImport() {
    this.addClass('_dirty');
    this.save({
      import: true
    });
  }

  onClick(event) {
    if (event.which !== 1) {
      return;
    }
    if (event.target === this.backBtn) {
      $.stopEvent(event);
      App.router.show('/');
    }
  }

  onAppCacheProgress(event) {
    if (event.lengthComputable) {
      const percentage = Math.round((event.loaded * 100) / event.total);
      this.saveBtn.textContent = `Downloading\u2026 (${percentage}%)`;
    }
  }
}
