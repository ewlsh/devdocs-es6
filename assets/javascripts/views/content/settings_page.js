import View from '../view';

import Notif from '../misc/notif';

import { settingsPage } from '../../templates/pages/settings_tmpl';

export default class SettingsPage extends View {
  constructor(...args) {
    super(...args);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }


  static LAYOUTS = ['_max-width', '_sidebar-hidden', '_native-scrollbars'];
  static SIDEBAR_HIDDEN_LAYOUT = '_sidebar-hidden';

  static className = '_static';

  static events = {
    click: 'onClick',
    change: 'onChange'
  };


  render() {
    this.html(settingsPage(this.currentSettings()));
  }

  currentSettings() {
    const settings = {};
    settings.dark = App.settings.get('dark');
    settings.smoothScroll = !App.settings.get('fastScroll');
    settings.arrowScroll = App.settings.get('arrowScroll');
    for (let layout of LAYOUTS) {
      settings[layout] = App.settings.hasLayout(layout);
    }
    return settings;
  }

  getTitle() {
    return 'Preferences';
  }

  toggleDark(enable) {
    const css = $('link[rel="stylesheet"][data-alt]');
    const alt = css.getAttribute('data-alt');
    css.setAttribute('data-alt', css.getAttribute('href'));
    css.setAttribute('href', alt);
    App.settings.set('dark', !!enable);
    if (App.appCache != null) {
      App.appCache.updateInBackground();
    }
  }

  toggleLayout(layout, enable) {
    if (layout !== SIDEBAR_HIDDEN_LAYOUT) {
      document.body.classList[enable ? 'add' : 'remove'](layout);
    }
    document.body.classList[$.overlayScrollbarsEnabled() ? 'add' : 'remove']('_overlay-scrollbars');
    App.settings.setLayout(layout, enable);
    if (App.appCache != null) {
      App.appCache.updateInBackground();
    }
  }

  toggleSmoothScroll(enable) {
    App.settings.set('fastScroll', !enable);
  }

  toggle(name, enable) {
    App.settings.set(name, enable);
  }

  export () {
    const data = new Blob([JSON.stringify(App.settings.export())], {
      type: 'application/json'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = 'devdocs.json';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  import (file, input) {
    if (!file || (file.type !== 'application/json')) {
      let notif = new Notif('ImportInvalid', {
        autoHide: false
      });
      notif.show();
      return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
      const data = (() => {
        try {
          return JSON.parse(reader.result);
        } catch (error) {}
      })();
      if (!data || (data.constructor !== Object)) {
        let notif = new Notif('ImportInvalid', {
          autoHide: false
        });
        notif.show();
        return;
      }
      App.settings.import(data);
      $.trigger(input.form, 'import');
    };
    reader.readAsText(file);
  }

  onChange(event) {
    const input = event.target;
    switch (input.name) {
      case 'dark':
        this.toggleDark(input.checked);
        break;
      case 'layout':
        this.toggleLayout(input.value, input.checked);
        break;
      case 'smoothScroll':
        this.toggleSmoothScroll(input.checked);
        break;
      case 'import':
        this.import(input.files[0], input);
        break;
      default:
        this.toggle(input.name, input.checked);
    }
  }

  onClick(event) {
    const target = $.eventTarget(event);
    switch (target.getAttribute('data-action')) {
      case 'export':
        $.stopEvent(event);
        this.export();
        break;
    }
  }

  onRoute(context) {
    this.render();
  }
}
