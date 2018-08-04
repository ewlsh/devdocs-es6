import { App } from '../app/app';
import Entry from './entry';
import {ajax} from '../lib/ajax';
import Model from './model';
import Entries from '../collections/entries';
import Types from '../collections/types';

export default class Doc extends Model {
  // Attributes: name, slug, type, version, release, db_size, mtime, links

  constructor() {
    super(...arguments);
    this.reset(this);
    this.slug_without_version = this.slug.split('~')[0];
    this.fullName = `${this.name}` + (this.version ? ` ${this.version}` : '');
    this.icon = this.slug_without_version;
    if (this.version) {
      this.short_version = this.version.split(' ')[0];
    }
    this.text = this.toEntry().text;
  }

  reset(data) {
    this.resetEntries(data.entries);
    this.resetTypes(data.types);
  }

  resetEntries(entries) {
    this.entries = new Entries(entries);
    this.entries.each(entry => {
      return entry.doc = this;
    });
  }

  resetTypes(types) {
    this.types = new Types(types);
    this.types.each(type => {
      return type.doc = this;
    });
  }

  fullPath(path) {
    if (path == null) {
      path = '';
    }
    if (path[0] !== '/') {
      path = `/${path}`;
    }
    return `/${this.slug}${path}`;
  }

  fileUrl(path) {
    return `${App.config.docs_origin}${this.fullPath(path)}?${this.mtime}`;
  }

  dbUrl() {
    return `${App.config.docs_origin}/${this.slug}/${App.config.db_filename}?${this.mtime}`;
  }

  indexUrl() {
    return `${App.indexHost()}/${this.slug}/${App.config.index_filename}?${this.mtime}`;
  }

  toEntry() {
    if (this.entry) {
      return this.entry;
    }
    this.entry = new Entry({
      doc: this,
      name: this.fullName,
      path: 'index'
    });
    if (this.version) {
      this.entry.addAlias(this.name);
    }
    return this.entry;
  }

  findEntryByPathAndHash(path, hash) {
    let entry;
    if (hash && (entry = this.entries.findBy('path', `${path}#${hash}`))) {
      return entry;
    } else if (path === 'index') {
      return this.toEntry();
    } else {
      return this.entries.findBy('path', path);
    }
  }

  load(onSuccess, onError, options) {
    if (options == null) {
      options = {};
    }
    if (options.readCache && this._loadFromCache(onSuccess)) {
      return;
    }

    const callback = data => {
      this.reset(data);
      onSuccess();
      if (options.writeCache) {
        this._setCache(data);
      }
    };

    return ajax({
      url: this.indexUrl(),
      success: callback,
      error: onError
    });
  }

  clearCache() {
    App.localStorage.del(this.slug);
  }

  _loadFromCache(onSuccess) {
    let data;
    if (!(data = this._getCache())) {
      return;
    }

    const callback = () => {
      this.reset(data);
      onSuccess();
    };

    setTimeout(callback, 0);
    return true;
  }

  _getCache() {
    let data;
    if (!(data = App.localStorage.get(this.slug))) {
      return;
    }

    if (data[0] === this.mtime) {
      return data[1];
    } else {
      this.clearCache();
      return;
    }
  }

  _setCache(data) {
    App.localStorage.set(this.slug, [this.mtime, data]);
  }

  install(onSuccess, onError, onProgress) {
    if (this.installing) {
      return;
    }
    this.installing = true;

    const error = () => {
      this.installing = null;
      onError();
    };

    const success = data => {
      this.installing = null;
      App.db.store(this, data, onSuccess, error);
    };

    ajax({
      url: this.dbUrl(),
      success,
      error,
      progress: onProgress,
      timeout: 3600
    });
  }

  uninstall(onSuccess, onError) {
    if (this.installing) {
      return;
    }
    this.installing = true;

    const success = () => {
      this.installing = null;
      onSuccess();
    };

    const error = () => {
      this.installing = null;
      onError();
    };

    App.db.unstore(this, success, error);
  }

  getInstallStatus(callback) {
    App.db.version(this, value => callback({
      installed: !!value,
      mtime: value
    }));
  }

  isOutdated(status) {
    return status && status.installed && (this.mtime !== status.mtime);
  }
};
