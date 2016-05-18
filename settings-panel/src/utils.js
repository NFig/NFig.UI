import marked from 'marked';
import assign from 'object-assign';
import qs from 'qs';

/**
 * Adds a  stylesheet to the DOM
 */
export function loadCustomStyleSheet(url) {

    // Is this a .less sheet?
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    const isLess = /\.less$/.test(url);
    const less = window.less;
    if (isLess) {
        if (!less) {
            console.error && console.error(`LessJS not loaded, can't load less stylesheet ${url}`);
            return;
        }

        link.rel = 'stylesheet/less';
    }

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);

    if (isLess) {
        less.sheets.push(link);
        less.refresh();
    }
}


/**
 * Sort of like Array.join, but doesn't
 * returns a string, it just adds new elements
 * that separate existing elements in arr
 */
export function intersperse(arr, sep) {
    if (!arr)
        return [];

    if ((arr.size || arr.length) === 0)
        return [];

    const [first, ...rest] = arr;

    const out = [first];
    for (var i of rest) {
        out.push(sep);
        out.push(i);
    }

    return out;
}


/**
 * Markdown rendering
 */
const createMarkdownRenderer = (overrides = {}) => {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    title = title ? ` title="${title}"` : '';
    return `<a href="${href}"${title} target="_blank">${text}</a>`;
  }

  return assign(renderer, overrides);
};

const defaultRenderer = createMarkdownRenderer();

export function markdown (text, overrides) {

    const options = {
        renderer: overrides
            ? createMarkdownRenderer(overrides)
            : defaultRenderer
    };

    return marked(text, options);
}


/**
 * Determines if a DOM element matches
 * a given selector
 *
 * uses which ever native implementation exists
 */
export const matches = Element.prototype.matches
    ? (element, selector) => element.matches(selector)
    : (element, selector) => element.matchesSelector(selector)
    ;


/**
 * parses the hash as a querystring, and returns
 * an object representation of the querystring
 */
export function parseQueryString() {
    return location.hash.length > 1
        ? qs.parse(location.hash.substr(1))
        : {};
}

/**
 * updates the hashquerystring key with the given value
 * optionally calling replaceState instead of pushState
 */
export function updateQueryString(key, value, replace = false) {
    const query = parseQueryString();
    if (value)
        query[key] = value;
    else
        delete query[key];

    let queryString = qs.stringify(query);

    if (queryString.length > 0)
        queryString = `#${queryString}`;

    if (location.hash !== queryString) {
        const method = replace
            ? history.replaceState
            : history.pushState;

        method.call(history, null, null, `${location.pathname}${queryString}`);
    }
}


/**
 * Defines an enum, which is simply a read-only object
 * where the keys and the values are the same
 *
 * Used for action types
 */
export function defineEnum(...names) {
    const v = names.reduce((o, name) => (o[name] = name, o), {});
    Object.freeze(v);
    return v;
}

/**
 * Ensures an element is on-screen by adjusting the page scroll
 */
export function scrollToElement(node) {
    // check if contained by window
    const rect = node.getBoundingClientRect();

    const bottom = (window.innerHeight || document.documentElement.clientHeight);

    if (rect.top < 94) { // arbitrary point below the nav bar
        // off the top of the screen
        window.scrollBy(0, rect.top - 94);
    } else if (rect.bottom > bottom) {
        // off the bottom edge
        window.scrollBy(0, (rect.bottom - bottom) + 10); // add 10px padding just because
    }
}


/**
 * Case insensitive string search
 */
export function contains(str, search) {
    return str.toLowerCase().indexOf(search.toLowerCase()) !== -1
}

/**
 * Simply retrieves the part of a string from the beginning to the first dot
 */
export function getGroupName(s) {
    return s.replace(/^([^\.]+)\..+$/, '$1');
}

/**
 * Trims a string if it's passed, otherwise returns
 */
export function trim(s) {
    if (typeof s === 'undefined' || s === null)
        return '';

    if (typeof s === 'string')
        return s.trim();

    return s.toString().trim();
}
