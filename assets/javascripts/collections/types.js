import Collection from './collection';

export default class Types extends Collection {

  static model = 'Type';

  static GUIDES_RGX = /(^|\()(guides?|tutorials?|reference|book|getting\ started|manual|examples)($|[\):])/i;
  static APPENDIX_RGX = /appendix/i;

  groups() {
    const result = [];
    for (let type of this.models) {
      var name;
      (result[name = this._groupFor(type)] || (result[name] = [])).push(type);
    }
    return result.filter(e => e.length > 0);
  }

  _groupFor(type) {
    if (GUIDES_RGX.test(type.name)) {
      return 0;
    } else if (APPENDIX_RGX.test(type.name)) {
      return 2;
    } else {
      return 1;
    }
  }
}
