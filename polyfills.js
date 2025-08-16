/* Browser Polyfills for IE11 and older browsers */

// Console polyfill for very old browsers
if (typeof console === 'undefined') {
  window.console = {
    log: function() {},
    error: function() {},
    warn: function() {},
    info: function() {}
  };
}

// Array.from polyfill for IE11
if (!Array.from) {
  Array.from = function(arrayLike, mapFn, thisArg) {
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    
    var items = Object(arrayLike);
    var len = parseInt(items.length) || 0;
    var A = typeof this === 'function' ? Object(new this(len)) : new Array(len);
    
    var k = 0;
    var kValue;
    while (k < len) {
      kValue = items[k];
      if (mapFn) {
        A[k] = typeof thisArg === 'undefined' ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    A.length = len;
    return A;
  };
}

// Array.forEach polyfill for IE8 and below
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

// Array.map polyfill
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
    var T, A, k;
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}

// Array.filter polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun) {
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = parseInt(t.length) || 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }
    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}

// Array.find polyfill
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = parseInt(list.length) || 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// Array.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    function sameValueZero(x, y) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    for (; k < len; k++) {
      if (sameValueZero(O[k], searchElement)) {
        return true;
      }
    }
    return false;
  };
}

// String.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// String.startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

// String.endsWith polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, length) {
    if (typeof length === 'undefined' || length > this.length) {
      length = this.length;
    }
    return this.substring(length - searchString.length, length) === searchString;
  };
}

// Object.assign polyfill
if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Promise polyfill (simple implementation)
if (typeof Promise === 'undefined') {
  window.Promise = function(executor) {
    var self = this;
    self.state = 'pending';
    self.value = undefined;
    self.handlers = [];

    function resolve(result) {
      if (self.state === 'pending') {
        self.state = 'fulfilled';
        self.value = result;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function reject(error) {
      if (self.state === 'pending') {
        self.state = 'rejected';
        self.value = error;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function handle(handler) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(self.value);
        }
      }
    }

    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: function(result) {
            try {
              resolve(onFulfilled ? onFulfilled(result) : result);
            } catch (ex) {
              reject(ex);
            }
          },
          onRejected: function(error) {
            try {
              resolve(onRejected ? onRejected(error) : error);
            } catch (ex) {
              reject(ex);
            }
          }
        });
      });
    };

    this.catch = function(onRejected) {
      return this.then(null, onRejected);
    };

    executor(resolve, reject);
  };

  Promise.resolve = function(value) {
    return new Promise(function(resolve) {
      resolve(value);
    });
  };

  Promise.reject = function(reason) {
    return new Promise(function(resolve, reject) {
      reject(reason);
    });
  };
}

// Fetch API polyfill (basic implementation)
if (typeof fetch === 'undefined') {
  window.fetch = function(url, options) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var method = (options && options.method) || 'GET';
      var body = (options && options.body) || null;
      var headers = (options && options.headers) || {};

      xhr.open(method, url, true);

      // Set headers
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            url: url,
            text: function() {
              return Promise.resolve(xhr.responseText);
            },
            json: function() {
              try {
                return Promise.resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                return Promise.reject(e);
              }
            },
            headers: {
              get: function(name) {
                return xhr.getResponseHeader(name);
              }
            }
          };

          if (response.ok) {
            resolve(response);
          } else {
            reject(new Error('Network response was not ok'));
          }
        }
      };

      xhr.onerror = function() {
        reject(new Error('Network error'));
      };

      xhr.send(body);
    });
  };
}

// addEventListener polyfill for IE8
if (!Element.prototype.addEventListener) {
  Element.prototype.addEventListener = function(event, handler, useCapture) {
    var element = this;
    var eventName = 'on' + event;
    
    if (!element[eventName]) {
      element[eventName] = function(e) {
        var event = e || window.event;
        event.target = event.target || event.srcElement;
        event.preventDefault = event.preventDefault || function() {
          event.returnValue = false;
        };
        event.stopPropagation = event.stopPropagation || function() {
          event.cancelBubble = true;
        };
        handler.call(element, event);
      };
    }
    
    if (element.attachEvent) {
      element.attachEvent(eventName, handler);
    }
  };
}

if (!Element.prototype.removeEventListener) {
  Element.prototype.removeEventListener = function(event, handler) {
    var eventName = 'on' + event;
    if (this.detachEvent) {
      this.detachEvent(eventName, handler);
    }
  };
}

// querySelector polyfill for IE7
if (!document.querySelector) {
  document.querySelector = function(selector) {
    var elements = document.querySelectorAll(selector);
    return elements.length > 0 ? elements[0] : null;
  };
}

if (!document.querySelectorAll) {
  document.querySelectorAll = function(selector) {
    var style = document.createElement('style');
    var elements = [];
    var element;
    var i;

    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selector + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}

// classList polyfill for IE9 and below
if (!('classList' in document.createElement('_'))) {
  (function(view) {
    if (!('Element' in view)) return;

    var classListProp = 'classList',
        protoProp = 'prototype',
        elemCtrProto = view.Element[protoProp],
        objCtr = Object,
        strTrim = String[protoProp].trim || function() {
          return this.replace(/^\s+|\s+$/g, '');
        },
        arrIndexOf = Array[protoProp].indexOf || function(item) {
          var i = 0,
              len = this.length;
          for (; i < len; i++) {
            if (i in this && this[i] === item) {
              return i;
            }
          }
          return -1;
        },
        DOMTokenList = function(el) {
          this.el = el;
          var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
          for (var i = 0; i < classes.length; i++) {
            this.push(classes[i]);
          }
          this._updateClassName = function() {
            el.className = this.toString();
          };
        },
        tokenListProto = DOMTokenList[protoProp] = [],
        tokenListGetter = function() {
          return new DOMTokenList(this);
        };

    tokenListProto.item = function(i) {
      return this[i] || null;
    };

    tokenListProto.contains = function(token) {
      token += '';
      return arrIndexOf.call(this, token) !== -1;
    };

    tokenListProto.add = function() {
      var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false;
      do {
        token = tokens[i] + '';
        if (arrIndexOf.call(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };

    tokenListProto.remove = function() {
      var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false,
          index;
      do {
        token = tokens[i] + '';
        index = arrIndexOf.call(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = arrIndexOf.call(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };

    tokenListProto.toggle = function(token, force) {
      token += '';

      var result = this.contains(token),
          method = result ?
          force !== true && 'remove' : force !== false && 'add';

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };

    tokenListProto.toString = function() {
      return this.join(' ');
    };

    if (objCtr.defineProperty) {
      var defineProperty = function(object, property, definition) {
        if (definition.get || definition.set) {
          objCtr.defineProperty(object, property, definition);
        } else {
          object[property] = definition.value;
        }
      };
      try {
        defineProperty(elemCtrProto, classListProp, {
          get: tokenListGetter,
          enumerable: true,
          configurable: true
        });
      } catch (ex) {
        if (ex.number === -0x7FF5EC54) {
          defineProperty(elemCtrProto, classListProp, {
            value: tokenListGetter
          });
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, tokenListGetter);
    }
  }(self));
}

// Date.now polyfill
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

// JSON polyfill for very old browsers
if (typeof JSON === 'undefined') {
  window.JSON = {
    parse: function(text) {
      return eval('(' + text + ')');
    },
    stringify: function(obj) {
      var type = typeof obj;
      if (type === 'string') {
        return '"' + obj + '"';
      } else if (type === 'number' || type === 'boolean') {
        return obj.toString();
      } else if (obj === null) {
        return 'null';
      } else if (obj === undefined) {
        return 'undefined';
      } else if (obj instanceof Array) {
        var arr = [];
        for (var i = 0; i < obj.length; i++) {
          arr.push(JSON.stringify(obj[i]));
        }
        return '[' + arr.join(',') + ']';
      } else if (type === 'object') {
        var pairs = [];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            pairs.push(JSON.stringify(key) + ':' + JSON.stringify(obj[key]));
          }
        }
        return '{' + pairs.join(',') + '}';
      }
    }
  };
}

console.log('Browser polyfills loaded successfully');
