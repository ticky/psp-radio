// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"images/about_icon.png":[function(require,module,exports) {
module.exports = "/about_icon.7d1a1c45.png";
},{}],"scripts/xmb.js":[function(require,module,exports) {
var DEFAULT_MENU = [{
  title: 'INTERNET RADIO PLAYER I',
  url: '../players/PLAYER_I/index.html',
  iconUrl: '../players/PLAYER_I/icon.png'
}, {
  title: 'INTERNET RADIO PLAYER II',
  url: '../players/PLAYER_II/index.html',
  iconUrl: '../players/PLAYER_II/icon.png'
}, {
  title: 'Back to the 80\'s',
  url: '../players/clip_80s/index.html',
  iconUrl: '../players/clip_80s/icon.png'
}, {
  title: 'ROCK',
  url: '../players/clip_rock/index.html',
  iconUrl: '../players/clip_rock/icon.png'
}, {
  title: 'COUNTERCULTURE',
  url: '../players/clip_alternative/index.html',
  iconUrl: '../players/clip_alternative/icon.png'
}, {
  title: 'BRITISH CULTURE',
  url: '../players/clip_british/index.html',
  iconUrl: '../players/clip_british/icon.png'
}, {
  title: 'All The Classics',
  url: '../players/clip_classic/index.html',
  iconUrl: '../players/clip_classic/icon.png'
}, {
  title: 'Jazz in 246',
  url: '../players/clip_jazz/index.html',
  iconUrl: '../players/clip_jazz/icon.png'
}, {
  title: 'India',
  url: '../players/clip_india/index.html',
  iconUrl: '../players/clip_india/icon.png'
}, {
  title: 'J-POP',
  url: '../players/clip_jpop/index.html',
  iconUrl: '../players/clip_jpop/icon.png'
}, {
  title: 'K-POP',
  url: '../players/clip_kpop2/index.html',
  iconUrl: '../players/clip_kpop2/icon.png'
}, {
  title: 'ANIMECAN',
  url: '../players/clip_anime/index.html',
  iconUrl: '../players/clip_anime/icon.png'
}, {
  title: 'GAME START',
  url: '../players/clip_game/index.html',
  iconUrl: '../players/clip_game/icon.png'
}, {
  title: 'Healing Time',
  url: '../players/clip_relax/index.html',
  iconUrl: '../players/clip_relax/icon.png'
}, {
  title: 'Soundtrack',
  url: '../players/clip_soundtrack/index.html',
  iconUrl: '../players/clip_soundtrack/icon.png'
}, {
  title: 'TO JAZZ OR NOT TO JAZZ, THAT IS THE QUESTION',
  url: '../players/os_JazzOrNot/index.html',
  iconUrl: '../players/os_JazzOrNot/icon.png'
}, {
  title: 'Like On The Radio',
  url: '../players/os_LikeOnTheRadio/index.html',
  iconUrl: '../players/os_LikeOnTheRadio/icon.png'
}, {
  title: 'LATIN ON',
  url: '../players/os_LatinOn/index.html',
  iconUrl: '../players/os_LatinOn/icon.png'
}, {
  title: 'Hip Me, Hop You',
  url: '../players/os_HipMeHopYou/index.html',
  iconUrl: '../players/os_HipMeHopYou/icon.png'
}, {
  title: 'Coffee Or Tea',
  url: '../players/os_CoffeeOrTea/index.html',
  iconUrl: '../players/os_CoffeeOrTea/icon.png'
}, {
  title: 'a way to relax',
  url: '../players/os_AWayToRelax/index.html',
  iconUrl: '../players/os_AWayToRelax/icon.png'
}, {
  title: 'PUNKACOFUNKA',
  url: '../players/os_PUNKACOFUNKA/index.html',
  iconUrl: '../players/os_PUNKACOFUNKA/icon.png'
}, {
  title: 'FreeRadio 1.7',
  url: '../players/FreeRadio/index.html',
  iconUrl: '../players/FreeRadio/icon.png'
}, {
  title: 'About Internet Radio',
  url: 'http://web.archive.org/web/20140704222439id_/http://www.playstation.com/psp-app/radio/index.html',
  iconUrl: require('../images/about_icon.png')
}];
document.addEventListener('DOMContentLoaded', function () {
  var menu = document.getElementById('menu');
  DEFAULT_MENU.map(function (_ref) {
    var title = _ref.title,
        url = _ref.url,
        iconUrl = _ref.iconUrl;
    var iconElement = document.createElement('img');
    iconElement.src = iconUrl;
    var titleElement = document.createTextNode(title);
    var linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.appendChild(iconElement);
    linkElement.appendChild(titleElement);
    menu.appendChild(linkElement);
  });
});
},{"../images/about_icon.png":"images/about_icon.png"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51107" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","scripts/xmb.js"], null)
//# sourceMappingURL=/xmb.7e05e5fa.js.map