/*
 * Based on github.com/visionmedia/page.js
 * Licensed under the MIT license
 * Copyright 2012 TJ Holowaychuk <tj@vision-media.ca>
 */
// TODO Fix this messy comma function hack
let page;
export default (page = function page(value, fn) {
  if (typeof value === 'function') {
    page('*', value);
  } else if (typeof fn === 'function') {
    const route = new page._Route(value);
    page._callbacks.push(route.middleware(fn));
  } else if (typeof value === 'string') {
    page.show(value, fn);
  } else {
    page.start(value);
  }
}, function () {
  let running = false;
  let currentState = null;
  page._callbacks = [];

  page.start = function (options) {
    if (options == null) {
      options = {};
    }
    if (!running) {
      running = true;
      addEventListener('popstate', onpopstate);
      addEventListener('click', onclick);
      page.replace(currentPath(), null, null, true);
    }
  };

  page.stop = function () {
    if (running) {
      running = false;
      removeEventListener('click', onclick);
      removeEventListener('popstate', onpopstate);
    }
  };

  page.show = function (path, state) {
    let res;
    if (path === (currentState != null ? currentState.path : undefined)) {
      return;
    }
    const context = new Context(path, state);
    const previousState = currentState;
    currentState = context.state;
    if (res = page.dispatch(context)) {
      currentState = previousState;
      location.assign(res);
    } else {
      context.pushState();
      updateCanonicalLink();
      track();
    }
    return context;
  };

  page.replace = function (path, state, skipDispatch, init) {
    let result;
    let context = new Context(path, state || currentState);
    context.init = init;
    currentState = context.state;
    if (!skipDispatch) {
      result = page.dispatch(context);
    }
    if (result) {
      context = new Context(result);
      context.init = init;
      currentState = context.state;
      page.dispatch(context);
    }
    context.replaceState();
    updateCanonicalLink();
    if (!skipDispatch) {
      track();
    }
    return context;
  };

  page.dispatch = function (context) {
    let i = 0;
    var next = function () {
      let fn, res;
      if (fn = page._callbacks[i++]) {
        res = fn(context, next);
      }
      return res;
    };
    return next();
  };

  page.canGoBack = () => !Context.isIntialState(currentState);

  page.canGoForward = () => !Context.isLastState(currentState);

  var currentPath = () => location.pathname + location.search + location.hash;

  page._Context = class Context {

    static initialPath = currentPath();
    static sessionId = Date.now();
    static stateId = 0;

    static isIntialState(state) {
      return state.id === 0;
    }

    static isLastState(state) {
      return state.id === (this.stateId - 1);
    }

    static isInitialPopState(state) {
      return (state.path === this.initialPath) && (this.stateId === 1);
    }

    static isSameSession(state) {
      return state.sessionId === this.sessionId;
    }

    constructor(path, state) {
      if (path == null) {
        path = '/';
      }
      this.path = path;
      if (state == null) {
        state = {};
      }
      this.state = state;
      this.pathname = this.path.replace(/(?:\?([^#]*))?(?:#(.*))?$/, (_, query, hash) => {
        this.query = query;
        this.hash = hash;
        return '';
      });

      if (this.state.id == null) {
        this.state.id = this.constructor.stateId++;
      }
      if (this.state.sessionId == null) {
        this.state.sessionId = this.constructor.sessionId;
      }
      this.state.path = this.path;
    }

    pushState() {
      history.pushState(this.state, '', this.path);
    }

    replaceState() {
      try {
        history.replaceState(this.state, '', this.path);
      } catch (error) {} // NS_ERROR_FAILURE in Firefox
    }
  }

  page._Route = class Route {
    constructor(path, options) {
      this.path = path;
      if (options == null) {
        options = {};
      }
      this.keys = [];
      this.regexp = pathtoRegexp(this.path, this.keys);
    }

    middleware(fn) {
      return (context, next) => {
        let params;
        if (this.match(context.pathname, (params = []))) {
          context.params = params;
          return fn(context, next);
        } else {
          return next();
        }
      };
    }

    match(path, params) {
      let matchData;
      if (!(matchData = this.regexp.exec(path))) {
        return;
      }

      const iterable = matchData.slice(1);
      for (let i = 0; i < iterable.length; i++) {
        var key;
        let value = iterable[i];
        if (typeof value === 'string') {
          value = decodeURIComponent(value);
        }
        if ((key = this.keys[i])) {
          params[key.name] = value;
        } else {
          params.push(value);
        }
      }
      return true;
    }
  }

  var pathtoRegexp = function (path, keys) {
    if (path instanceof RegExp) {
      return path;
    }

    if (path instanceof Array) {
      path = `(${path.join('|')})`;
    }
    path = path
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
        if (slash == null) {
          slash = '';
        }
        if (format == null) {
          format = '';
        }
        keys.push({
          name: key,
          optional: !!optional
        });
        let str = optional ? '' : slash;
        str += '(?:';
        if (optional) {
          str += slash;
        }
        str += format;
        str += capture || (format ? '([^/.]+?)' : '([^/]+?)');
        str += ')';
        if (optional) {
          str += optional;
        }
        return str;
      }).replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');

    return new RegExp(`^${path}$`);
  };

  var onpopstate = function (event) {
    if (!event.state || Context.isInitialPopState(event.state)) {
      return;
    }

    if (Context.isSameSession(event.state)) {
      page.replace(event.state.path, event.state);
    } else {
      location.reload();
    }
  };

  var onclick = function (event) {
    try {
      if ((event.which !== 1) || event.metaKey || event.ctrlKey || event.shiftKey || event.defaultPrevented) {
        return;
      }
    } catch (error) {
      return;
    }

    let link = $.eventTarget(event);
    while (link && (link.tagName !== 'A')) {
      link = link.parentNode;
    }

    if (link && !link.target && isSameOrigin(link.href)) {
      event.preventDefault();
      let path = link.pathname + link.search + link.hash;
      path = path.replace(/^\/\/+/, '/'); // IE11 bug
      page.show(path);
    }
  };

  var isSameOrigin = url => url.indexOf(`${location.protocol}//${location.hostname}`) === 0;

  var updateCanonicalLink = function () {
    if (!this.canonicalLink) {
      this.canonicalLink = document.head.querySelector('link[rel="canonical"]');
    }
    return this.canonicalLink.setAttribute('href', `http://${location.host}${location.pathname}`);
  };

  const trackers = [];

  page.track = function (fn) {
    trackers.push(fn);
  };

  var track = function () {
    for (let tracker of (trackers)) {
      tracker.call();
    }
  };
}(), page);
