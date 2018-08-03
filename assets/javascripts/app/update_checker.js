import Notif from '../views/misc/notif';

export default class UpdateChecker {
  constructor() {
    this.checkDocs = this.checkDocs.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.lastCheck = Date.now();

    $.on(window, 'focus', this.onFocus);
    if (App.appCache) {
      App.appCache.on('updateready', this.onUpdateReady);
    }

    setTimeout(this.checkDocs, 0);
  }

  check() {
    if (App.appCache) {
      App.appCache.update();
    } else {
      ajax({
        url: $('script[src*="application"]').getAttribute('src'),
        dataType: 'application/javascript',
        error: (_, xhr) => {
          if (xhr.status === 404) {
            return this.onUpdateReady();
          }
        }
      });
    }
  }

  onUpdateReady() {
    let notif = new Notif('UpdateReady', {
      autoHide: null
    });
    notif.show();
  }

  checkDocs() {
    if (!App.settings.get('manualUpdate')) {
      App.docs.updateInBackground();
    } else {
      App.docs.checkForUpdates(i => {
        if (i > 0) {
          return this.onDocsUpdateReady();
        }
      });
    }
  }

  onDocsUpdateReady() {
    let notif = new Notif('UpdateDocs', {
      autoHide: null
    });
    notif.show();
  }

  onFocus() {
    if ((Date.now() - this.lastCheck) > 21600e3) {
      this.lastCheck = Date.now();
      this.check();
    }
  }
};
