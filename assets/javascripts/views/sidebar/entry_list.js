import PaginatedList from '../list/paginated_list';

export default class EntryList extends PaginatedList {

  static tagName = 'div';
  static className = '_list _list-sub';

  constructor(entries) {
    super(...arguments);
    this.entries = entries;

    this.renderPaginated();
    this.activate();
  }

  render(entries) {
    return this.tmpl('sidebarEntry', entries);
  }
}
