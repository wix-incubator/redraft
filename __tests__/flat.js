import React from 'react';
import ReactDOMServer from 'react-dom/server';
import redraft, { createStylesRenderer } from '../src';
import * as raws from './utils/raws';
import { joinRecursively, makeList } from './utils/helpers';

const customStyleMap = {
  BOLD: {
    'font-weight': 'bold',
  },
  ITALIC: {
    'font-style': 'italic',
  },
  UNDERLINE: {
    'text-decoration': 'underline',
  },
  STRIKETHROUGH: {
    'text-decoration': 'line-through',
  },
};

const customStyleMapReact = {
  BOLD: {
    fontWeight: 'bold',
  },
  ITALIC: {
    fontStyle: 'italic',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
};

const stringifyStyles = reduced => Object.keys(reduced)
  .map(key => `${key}:${reduced[key]}`).join(';');

// render to HTML
const styles = createStylesRenderer(
  ({ children, style }) => `<span style="${stringifyStyles(style)}">${joinRecursively(children)}</span>`,
  customStyleMap
);

// needs a key
const Inline = ({ children, style, key }) => <span key={key} style={style}>{children}</span>

const stylesReact = createStylesRenderer(
  Inline,
  customStyleMapReact
);

const blocks = {
  unstyled: (children) => `<p>${joinRecursively(children)}</p>`,
  blockquote: (children) => `<blockquote>${joinRecursively(children)}</blockquote>`,
  'ordered-list-item': (children) => `<ol>${makeList(children)}</ol>`,
  'unordered-list-item': (children) => `<ul>${makeList(children)}</ul>`,
};


const blocksReact = {
  unstyled: (children, { keys }) =>
    children.map((child, index) => <p key={keys[index]}>{child}</p>),
  blockquote: (children, { keys }) => <blockquote key={keys[0]} >{children}</blockquote>,
};

const entities = {
  LINK: (children, entity) => `<a href="${entity.url}">${joinRecursively(children)}</a>`,
  ENTITY: (children, entity) => `<div style="color: ${entity.data.color}" >${joinRecursively(children)}</div>`,
};

const entitiesReact = {
  LINK: (children, entity, { key }) => <a key={key} href={entity.url} >{children}</a>,
};

const renderers = {
  styles,
  blocks,
  entities,
};

const renderersReact = {
  styles: stylesReact,
  blocks: blocksReact,
  entities: entitiesReact,
};


// Helpers for te
const bold = 'font-weight:bold';
const italic = 'font-style:italic';
const textDecoration = 'text-decoration:underline line-through';

const getStyles = (...arr) => arr.join(';');

const correctRender = `<p><span style="${bold}">Lorem </span><a href="http://zombo.com/"><span style="${getStyles(bold, italic)}">ipsum</span></a><span style="${getStyles(bold, italic, textDecoration)}"> dolor</span><span style="${italic}"> sit amet,</span> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <span style="${italic}">ceteros invenire </span>tractatos his id. </blockquote><p><span style="${bold}">Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</span></p>` // eslint-disable-line max-len


describe('redraft with flat styles', () => {
  test('should render flat styles correctly', () => {
    const rendered = redraft(raws.raw, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(correctRender);
  });
  test(
    'should render flat styles correctly with ReactDOMServer.renderToStaticMarkup',
    () => {
      const rendered = <div>{redraft(raws.raw, renderersReact)}</div>;
      const stringified = ReactDOMServer.renderToStaticMarkup(rendered);
      expect(stringified).toBe(`<div>${correctRender}</div>`);
    }
  );
});
