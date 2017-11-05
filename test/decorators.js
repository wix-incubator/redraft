import chai, { expect } from 'chai';
import linkifyIt from 'linkify-it';
import { ContentBlock, convertFromRaw } from 'draft-js';
import tlds from 'tlds';
import redraft from '../src';
import { joinRecursively } from './helpers';
import TestDecorator from './TestDecorator';

chai.should();

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
const linkWithContentState = ({ decoratedText, children, contentState }) => {
  expect(contentState).to.be.an('object');
  return `<a href="${decoratedText}" >${joinRecursively(children)}</a>`;
};


const decorators = [
  {
    strategy: linkStrategy,
    component: link,
  },
];

const decoratorsContentState = [
  {
    strategy: linkStrategy,
    component: linkWithContentState,
  },
];

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

const rawWithLink2 = {
  entityMap: {},
  blocks: [{
    key: '8ofc8',
    text: 'Another raw with link: http://lokiuz.github.io/redraft/ and some extra text here.',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [{ offset: 0, length: 7, style: 'BOLD' }],
    entityRanges: [],
    data: {},
  }],
};

const rawWithNoText = {
  entityMap: {},
  blocks: [{
    key: '8ofc8',
    text: '',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
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

const renderersWithContentState = {
  inline,
  blocks,
  entities,
  decorators: decoratorsContentState,
};


describe('redraft with decorators', () => {
  it('should apply decorator ranges and call decorator component', () => {
    const rendered = redraft(rawWithLink, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<a href="http://lokiuz.github.io/redraft/" >http://lokiuz.<strong>github</strong>.io/redraft/</a>'); // eslint-disable-line max-len
  });
  it('match the decorator porperly', () => {
    const rendered = redraft(rawWithLink2, renderers);
    const joined = joinRecursively(rendered);
    joined.should.equal('<strong>Another</strong> raw with link: <a href="http://lokiuz.github.io/redraft/" >http://lokiuz.github.io/redraft/</a> and some extra text here.'); // eslint-disable-line max-len
  });
  it('should handle original ContentBlock', () => {
    const rendered = redraft(rawWithLink, renderers, {
      createContentBlock: block => new ContentBlock(block),
    });
    const joined = joinRecursively(rendered);
    joined.should.equal('<a href="http://lokiuz.github.io/redraft/" >http://lokiuz.<strong>github</strong>.io/redraft/</a>'); // eslint-disable-line max-len
  });
  it('should handle convertFromRawToDraftState in options', () => {
    const rendered = redraft(rawWithLink, renderersWithContentState, {
      convertFromRaw,
    });
    const joined = joinRecursively(rendered);
    joined.should.equal('<a href="http://lokiuz.github.io/redraft/" >http://lokiuz.<strong>github</strong>.io/redraft/</a>'); // eslint-disable-line max-len
  });
  it('should handle Decorator in options', () => {
    const rendered = redraft(rawWithLink, renderers, {
      Decorator: TestDecorator,
    });
    const joined = joinRecursively(rendered);
    joined.should.equal(`<span style="first first-${rawWithLink.blocks[0].key}" >h</span>ttp://lokiuz.<strong>github</strong>.io/redraft/`); // eslint-disable-line max-len
  });
  it('should handle Decorator in options with empty block', () => {
    const rendered = redraft(rawWithNoText, renderers, {
      Decorator: TestDecorator,
    });
    const joined = joinRecursively(rendered);
    joined.should.equal(''); // eslint-disable-line max-len
  });
});
