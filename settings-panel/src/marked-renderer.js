import assign from 'object-assign';
import marked from 'marked';
import intersperse from './intersperse';

const create = (overrides = {}) => {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    title = title ? ` title="${title}"` : '';
    return `<a href="${href}"${title} target="_blank">${text}</a>`;
  }

  return assign(renderer, overrides);
};

export function render(text, overrides = {}) {
    return marked(text, {renderer: create(overrides)});
}

