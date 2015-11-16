// nice clean wrapper around fetch

const enc = encodeURIComponent;

function toFormData(data) {
  return Object.keys(data).map(key =>
      `${enc(key)}=${enc(data[key])}`
  ).join('&');
}

export default function ajax(opts) {
  const setDefault = (obj, key, val) => obj[key] = obj[key] || val;

  if (typeof opts === 'undefined')
    throw 'Error calling ajax(): no url or options specified';

  if (typeof opts === 'string')
    opts = { url: opts };

  let {url, headers = {}, data, method = (data ? 'POST' : 'GET')} = opts;

  if (data && typeof data !== 'string') {
    data = toFormData(data);
    setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded');
  }

  var fetchOptions = {
    method,
    headers,
    body: data,
    credentials: 'same-origin'
  };


  let res;
  return fetch(url, fetchOptions).then(response => {
    res = { 
      status: response.status,
      response
    };

    const contentType = response.headers.get('Content-Type');
    if (/^application\/json/.test(contentType)) {
      return response.json();
    } else {
      return response.text();
    }
  }).then(body => {
    res.body = body;
    return res;
  });
}

function callWithMethod(method) {
  return function (opts) {
    opts = typeof opts === 'string' ? { url: opts } : opts;
    opts.method = method;
    return ajax(opts);
  }
}

ajax.get = callWithMethod('GET');
ajax.post = callWithMethod('POST');
ajax.put = callWithMethod('PUT');
ajax.del = callWithMethod('DELETE');
ajax.head = callWithMethod('HEAD');
ajax.patch = callWithMethod('PATCH');
ajax.options = callWithMethod('OPTIONS');

