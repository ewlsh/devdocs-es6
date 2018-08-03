import Notif from '../misc/notif';

export default class Tip extends Notif {
  static className = '_notif _notif-tip';

  static defautOptions = {
    autoHide: false
  };

  render() {
    this.html(this.tmpl(`tip${this.type}`));
  }
}
