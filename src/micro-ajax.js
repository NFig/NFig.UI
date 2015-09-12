var Promise = require('promise');

var ajax = function (opts, callback) {

  function setDefault(obj, key, value) {
    obj[key] = obj[key] || value;
  }

  if (typeof opts === 'undefined')
    throw 'Error calling ajax(): no url or options specified';

  if (typeof opts === 'string')
    opts = { url: opts };

  var headers = opts.header || {},
  data = opts.data,
  method = opts.method || (data ? 'POST' : 'GET'),
  callback = callback || opts.callback
    ;

  if (data && typeof data !== 'string') {
    data = Object.keys(data).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(this[key]);
    }, data).join('&');
  }

  var executor = function (resolve, reject) {

    var req = new XMLHttpRequest();

    req.addEventListener('load', function () {
      // Let's parse any json that comes back
      var body = req.responseText;
      if (/^application\/json/.test(req.getResponseHeader('Content-Type'))) {
        body = JSON.parse(body);
      }

      if (/^2/.test(req.status)) {
        resolve({ status: req.status, body, xhr: req });
      } else {
        reject({ status: req.status, body, xhr: req });
      }
    });

    if (data) {
      setDefault(headers, 'X-Requested-With', 'XMLHttpRequest');
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded');
    }

    req.open(method, opts.url, true);

    for (var key in headers) {
      req.setRequestHeader(key, headers[key]);
    }

    req.send(data);
  }

  var p = new Promise(executor);

  if (typeof callback === 'function')
    return p.then(callback);

  return p;
}

var callWithMethod = function (method) {
  return function (opts, callback) {
    opts = typeof opts === 'string' ? { url: opts } : opts;
    opts.method = method;
    return ajax(opts, callback);
  }
};

ajax.get = callWithMethod('GET');
ajax.post = callWithMethod('POST');
ajax.put = callWithMethod('PUT');
ajax.delete = callWithMethod('DELETE');
ajax.head = callWithMethod('HEAD');
ajax.patch = callWithMethod('PATCH');
ajax.options = callWithMethod('OPTIONS');

export default ajax;
