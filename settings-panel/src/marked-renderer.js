import assign from 'object-assign';
import marked from 'marked';

const create = (overrides = {}) => {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    title = title ? ` title="${title}"` : '';
    return `<a href="${href}"${title} target="_blank">${text}</a>`;
  }

  return assign(renderer, overrides);
};

export const render = (text, overrides = {}) => 
  marked(text, {renderer: create(overrides)});
