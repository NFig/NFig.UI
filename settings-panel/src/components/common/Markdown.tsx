import * as React from 'react';
import marked from 'marked';
import styled from 'emotion/react';

const md = (() => {
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    return `<a href="${href}"${title
      ? `title="${title}"`
      : ''} target="_blank">${text}</a>`;
  };

  return (src: string) => marked(src, { renderer });
})();

const onMarkdownLinkClick = (e: React.MouseEvent<HTMLElement>) => {
  if ((e.target as HTMLElement).tagName === 'A') {
    e.stopPropagation();
  }
};

const Markdown = styled(
  ({ src, ...rest }: { src: string } & React.HTMLProps<HTMLDivElement>) => (
    <div
      onClick={onMarkdownLinkClick}
      {...rest}
      dangerouslySetInnerHTML={{ __html: md(src) }}
    />
  ),
)`
  & a {
    color: #07c;
  }
  & p {
    margin: 0.3em 0;
  }
`;

export default Markdown;
