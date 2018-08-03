require('./lib/license');
require('./app/app');
require('./app/config');
require('./collections/collection');
require('./models/model');
require('./views/view');
require('./tracking');

function requireAll(r) {
  r.keys().forEach(r);
}

requireAll(require.context('./lib/', true, /\.js$/));
requireAll(require.context('./views/', true, /\.js$/));
requireAll(require.context('./templates/', true, /\.js$/));
requireAll(require.context('./models/', true, /\.js$/));
requireAll(require.context('./collections/', true, /\.js$/));
requireAll(require.context('./app/', true, /\.js$/));
requireAll(require.context('./vendor/', true, /\.js$/));


var init = function () {
  document.removeEventListener('DOMContentLoaded', init, false);

  if (document.body) {
    return app.init();
  } else {
    return setTimeout(init, 42);
  }
};

document.addEventListener('DOMContentLoaded', init, false);
