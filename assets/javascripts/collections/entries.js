import Collection from './collection'

import Entry from '../models/entry';

export default class Entries extends Collection {
  constructor(...args) {
    super(...args);
  }

  model() {
    return Entry;
  }
}
