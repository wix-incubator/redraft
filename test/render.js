import chai from 'chai';
import redraft, { renderRaw } from '../src';

chai.should();

const raw = {
  entityMap: {
    0: {
      data: {
        url: 'http://zombo.com/',
      },
      type: 'LINK',
      mutability: 'MUTABLE',
    },
  },
  blocks: [{
    key: '77n1t',
    text: 'Lorem ipsum dolor sit amet, pro nisl sonet ad. ',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 0,
        length: 17,
        style: 'BOLD',
      },
      {
        offset: 6,
        length: 21,
        style: 'ITALIC',
      },
    ],
    entityRanges: [
      {
        key: 0,
        offset: 6,
        length: 5,
      },
    ],
  }, {
    key: 'a005',
    text: 'Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, ceteros invenire tractatos his id. ', // eslint-disable-line max-len
    type: 'blockquote',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 80,
        length: 17,
        style: 'ITALIC',
      },
    ],
    entityRanges: [],
  }, {
    key: 'ee96q',
    text: 'Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 0,
        length: 99,
        style: 'BOLD',
      },
    ],
    entityRanges: [],
  }],
};

const raw2 = {
  entityMap: {},
  blocks: [{
    key: 'az45a',
    text: '!', // eslint-disable-line max-len
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
  }],
};

// to render to a plain string we need to be sure all the arrays are joined after render
const joinRecursively = (array) => array.map((child) => {
  if (Array.isArray(child)) {
    return joinRecursively(child);
  }
  return child;
}).join('');

// render to HTML

const inline = {
  BOLD: (children) => `<strong>${children.join('')}</strong>`,
  ITALIC: (children) => `<em>${children.join('')}</em>`,
};

const blocks = {
  unstyled: (children) => `<p>${joinRecursively(children)}</p>`,
  blockquote: (children) => `<blockquote>${joinRecursively(children)}</blockquote>`,
};

const entities = {
  LINK: (children, entity) => `<a href="${entity.url}" >${joinRecursively(children)}</a>`,
};

const renderers = {
  inline,
  blocks,
  entities,
};

describe('renderRaw', () => {
  it('should render correctly', () => {
    const rendered = redraft(raw, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em> dolor</em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'); // eslint-disable-line max-len
  });
  it('should render blocks with single char correctly', () => {
    const rendered = redraft(raw2, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p>!</p>'); // eslint-disable-line max-len
  });
  it('should render correctly with deprecated api', () => {
    const rendered = renderRaw(raw, inline, blocks, entities);
    const joined = joinRecursively(rendered);
    joined.should.equal('<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em> dolor</em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'); // eslint-disable-line max-len
  });
});
