import Model from './model';
import Entry from './entry';

export default class Type extends Model {
  // Attributes: name, slug, count

  fullPath() {
    return `/${this.doc.slug}-${this.slug}/`;
  }

  entries() {
    return this.doc.entries.findAllBy('type', this.name);
  }

  toEntry() {
    return new Entry({
      doc: this.doc,
      name: `${this.doc.name} / ${this.name}`,
      path: `..${this.fullPath()}`
    });
  }
}
