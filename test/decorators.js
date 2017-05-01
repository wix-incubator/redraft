import chai from 'chai';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import redraft from '../src';
import { joinRecursively } from './helpers';

const linkify = linkifyIt();
linkify.tlds(tlds);

const linkStrategy = (contentBlock, callback) => {
  const links = linkify.match(contentBlock.get('text'));
  if (typeof links !== 'undefined' && links !== null) {
    for (let i = 0; i < links.length; i += 1) {
      callback(links[i].index, links[i].lastIndex);
    }
  }
};


const link = ({ decoratedText, children }) => `<a href="${decoratedText}" >${joinRecursively(children)}</a>`;


const decorators = [
  {
    strategy: linkStrategy,
    component: link,
  },
];


chai.should();

const rawWithLink = {
  entityMap: {},
  blocks: [{
    key: '8ofc8',
    text: 'http://lokiuz.github.io/redraft/',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [{ offset: 14, length: 6, style: 'BOLD' }],
    entityRanges: [],
    data: {},
  }],
};


const inline = {
  BOLD: (children) => `<strong>${children.join('')}</strong>`,
  ITALIC: (children) => `<em>${children.join('')}</em>`,
};

const blocks = {
  unstyled: (children) => `${joinRecursively(children)}`,
};

const entities = {
  ENTITY: (children, entity) => `<div style='color: ${entity.data.color}' >${joinRecursively(children)}</div>`,
};

const renderers = {
  inline,
  blocks,
  entities,
  decorators,
};

describe('redraft with decorators', () => {
  it('should apply decorator ranges and call decorator component', () => {
    const rendered = redraft(rawWithLink, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<a href="http://lokiuz.github.io/redraft/" >http://lokiuz.<strong>github</strong>.io/redraft/</a>'); // eslint-disable-line max-len
  });
});
