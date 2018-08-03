import Notif from '../misc/notif';
import { App } from '../../app/app';
import { notifUpdates } from '../../templates/notif_tmpl';

export default class Updates extends Notif {

  static className = Updates.className + ' _notif-news';

  static defautOptions = {
    autoHide: 30000
  };

  constructor(...args) {
    super(...args);

    this.lastUpdateTime = this.getLastUpdateTime();
    this.updatedDocs = this.getUpdatedDocs();
    this.updatedDisabledDocs = this.getUpdatedDisabledDocs();
    if ((this.updatedDocs.length > 0) || (this.updatedDisabledDocs.length > 0)) {
      this.show();
    }
    this.markAllAsRead();
  }

  render() {
    this.html(notifUpdates(this.updatedDocs, this.updatedDisabledDocs));
  }

  getUpdatedDocs() {
    if (!this.lastUpdateTime) {
      return [];
    }
    return App.docs.all().filter((doc) => doc.mtime > this.lastUpdateTime);
  }

  getUpdatedDisabledDocs() {
    if (!this.lastUpdateTime) {
      return [];
    }
    return (() => {
      const result = [];
      for (let doc of App.disabledDocs.all()) {
        if ((doc.mtime > this.lastUpdateTime) && App.docs.findBy('slug_without_version', doc.slug_without_version)) {
          result.push(doc);
        }
      }
      return result;
    })();
  }

  getLastUpdateTime() {
    return App.settings.get('version');
  }

  markAllAsRead() {
    App.settings.set('version', App.config.env === 'production' ? App.config.version : Math.floor(Date.now() / 1000));
  }
}
