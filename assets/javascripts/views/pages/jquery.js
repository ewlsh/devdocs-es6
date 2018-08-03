import BasePage from './base';

export default class JqueryPage extends BasePage {
  constructor(...args) {
    super(...args);
    this.onIframeLoaded = this.onIframeLoaded.bind(this);

  }

  static demoClassName = '_jquery-demo';

  afterRender() {
    // Prevent jQuery Mobile's demo iframes from scrolling the page
    for (let iframe of this.findAllByTag('iframe')) {
      iframe.style.display = 'none';
      $.on(iframe, 'load', this.onIframeLoaded);
    }

    return this.runExamples();
  }

  onIframeLoaded(event) {
    event.target.style.display = '';
    $.off(event.target, 'load', this.onIframeLoaded);
  }

  runExamples() {
    for (let el of this.findAllByClass('entry-example')) {
      try {
        this.runExample(el);
      } catch (error) {}
    }
  }

  runExample(el) {
    let iframe;
    const source = el.getElementsByClassName('syntaxhighlighter')[0];
    if (!source || (source.innerHTML.indexOf('!doctype') === -1)) {
      return;
    }

    if (!(iframe = el.getElementsByClassName(this.constructor.demoClassName)[0])) {
      iframe = document.createElement('iframe');
      iframe.className = this.constructor.demoClassName;
      iframe.width = '100%';
      iframe.height = 200;
      el.appendChild(iframe);
    }

    const doc = iframe.contentDocument;
    doc.write(this.fixIframeSource(source.textContent));
    doc.close();
  }

  fixIframeSource(source) {
    source = source.replace('"/resources/', '"https://api.jquery.com/resources/'); // attr(), keydown()
    source = source.replace('</head>', `\
<style>
  html, body { border: 0; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
</style>
<script>
  $.ajaxPrefilter(function(opt, opt2, xhr) {
    if (opt.url.indexOf('http') !== 0) {
      xhr.abort();
      document.body.innerHTML = "<p><strong>This demo cannot run inside DevDocs.</strong></p>";
    }
  });
</script>
</head>\
`);
    return source.replace(/<script>/gi, '<script nonce="devdocs">');
  }
}
