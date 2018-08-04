import Notif from '../misc/notif';
import { notifNews } from '../../templates/notif_tmpl';

import {App} from '../../app/app';

export default class News extends Notif {
  static className = News.className + ' _notif-news';

  static defautOptions = {
    autoHide: 30000
  };

  constructor(...args) {
    super(...args);

    this.unreadNews = this.getUnreadNews();

    if (this.unreadNews.length) {
      this.show();
    }

    this.markAllAsRead();
  }

  render() {
    this.html(notifNews(this.unreadNews));
  }

  getUnreadNews() {
    let time;
    if (!(time = this.getLastReadTime())) {
      return [];
    }

    return (() => {
      const result = [];
      for (let news of Array.from(App.news)) {
        if (new Date(news[0]).getTime() <= time) {
          break;
        }
        result.push(news);
      }
      return result;
    })();
  }

  getLastNewsTime() {
    return new Date(App.news[0][0]).getTime();
  }

  getLastReadTime() {
    return App.settings.get('news');
  }

  markAllAsRead() {
    App.settings.set('news', this.getLastNewsTime());
  }
}