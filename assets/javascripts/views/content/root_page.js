import View from '../view';
import { App } from '../../app/app';

export default class RootPage extends View {
  constructor(...args) {
    super(...args);

    this.onClick = this.onClick.bind(this);

    if (!this.isHidden()) {
      this.setHidden(false);
    } // reserve space in local storage

    this.render();
  }

  static events = {
    click: 'onClick'
  };

  render() {
    this.empty();

    let tmpl = App.isAndroidWebview() ?
      'androidWarning' :
      this.isHidden() ?
      'splash' :
      App.isMobile() ?
      'mobileIntro' :
      'intro';

    // temporary
    if ((location.host === 'devdocs.io') && (location.protocol === 'http:')) {
      tmpl = 'httpWarning';
    }

    this.append(this.tmpl(tmpl));
  }

  hideIntro() {
    this.setHidden(true);
    this.render();
  }

  setHidden(value) {
    App.settings.set('hideIntro', value);
  }

  isHidden() {
    return App.isSingleDoc() || App.settings.get('hideIntro');
  }

  onRoute() {}

  onClick(event) {
    if ($.eventTarget(event).hasAttribute('data-hide-intro')) {
      $.stopEvent(event);
      this.hideIntro();
    }
  }
}
