import {
  App
} from './app/app';

var init = function () {
  document.removeEventListener('DOMContentLoaded', init, false);

  if (document.body) {
    return App.init();
  } else {
    return setTimeout(init, 42);
  }
};

document.addEventListener('DOMContentLoaded', init, false);
