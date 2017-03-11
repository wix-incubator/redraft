import chai from 'chai';
import redraft from '../src';
import * as raws from './raws';
import { joinRecursively, makeList } from './helpers';

const should = chai.should();

const customStyleMap = {
  BOLD: {
    fontWeight: 'bold',
  },
  ITALIC: {
    fontStyle: 'italic',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
};


const mapStyles = styleArray => {
  const stylesMap = styleArray.map(style => customStyleMap[style])
  const reduced = stylesMap.reduce((prev, next) => Object.assign({}, prev, next), {})
  return Object.keys(reduced).map(key => `${key}: ${reduced[key]}`).join(';')
};
// render to HTML
const styles = (children, styleArray) => `<span style="${mapStyles(styleArray)}">${joinRecursively(children)}</span>`;

const blocks = {
  unstyled: (children) => `<p>${joinRecursively(children)}</p>`,
  blockquote: (children) => `<blockquote>${joinRecursively(children)}</blockquote>`,
  'ordered-list-item': (children) => `<ol>${makeList(children)}</ol>`,
  'unordered-list-item': (children) => `<ul>${makeList(children)}</ul>`,
};

const entities = {
  LINK: (children, entity) => `<a href="${entity.url}" >${joinRecursively(children)}</a>`,
  ENTITY: (children, entity) => `<div style="color: ${entity.data.color}" >${joinRecursively(children)}</div>`,
};

const renderers = {
  styles,
  blocks,
  entities,
};

// Helpers for te
const bold = 'fontWeight: bold';
const italic = 'fontStyle: italic';

describe('redraft with flat styles', () => {
  it('should render flat styles correctly', () => {
    const rendered = redraft(raws.raw, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal(
      `<p><span style="${bold}">Lorem </span><a href="http://zombo.com/" ><span style="${bold};${italic}">ipsum</span></a><span style="${bold};${italic}"> dolor</span><span style="${italic}"> sit amet,</span> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <span style="${italic}">ceteros invenire </span>tractatos his id. </blockquote><p><span style="${bold}">Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</span></p>` // eslint-disable-line max-len
    );
  });
});
