import redraft from '../src';
import createBlockRenderer from '../src/createBlockRenderer';
import * as raws from './utils/raws';
import { joinRecursively, makeList } from './utils/helpers';

// render to HTML
const inline = {
  BOLD: children => `<strong>${children.join('')}</strong>`,
  ITALIC: children => `<em>${children.join('')}</em>`,
  UNDERLINE: children => `<u>${children.join('')}</u>`,
  STRIKETHROUGH: children =>
    `<span style=text-decoration:line-through;>${children.join('')}</span>`,
};

const blocks = {
  unstyled: children => `<p>${joinRecursively(children)}</p>`,
  blockquote: children =>
    `<blockquote>${joinRecursively(children)}</blockquote>`,
  'ordered-list-item': children => `<ol>${makeList(children)}</ol>`,
  'unordered-list-item': children => `<ul>${makeList(children)}</ul>`,
};

const atomicBlocks = {
  resizable: (children, { width }, key) =>
    `<div key="${key}" style="width: ${width};" >${joinRecursively(children)}</div>`,
  image: (children, { src, alt }, key) =>
    `<img key="${key}" src="${src}" alt="${alt}" />`,
};

const dataBlocks = {
  unstyled: children => `<p>${joinRecursively(children)}</p>`,
  atomic: (children, { keys, data }) => {
    const maped = children.map((child, i) =>
      atomicBlocks[data[i].type](child, data[i], keys[i])
    );
    return joinRecursively(maped);
  },
};

const entities = {
  LINK: (children, entity) =>
    `<a href="${entity.url}" >${joinRecursively(children)}</a>`,
  ENTITY: (children, entity) =>
    `<div style="color: ${entity.data.color}" >${joinRecursively(children)}</div>`,
};

const renderers = {
  inline,
  blocks,
  entities,
};

const blocksWithKeys = {
  unstyled: (children, { keys }) =>
    `<p key="${keys.join(',')}">${joinRecursively(children)}</p>`,
  blockquote: (children, { keys }) =>
    `<blockquote key="${keys.join(',')}">${joinRecursively(children)}</blockquote>`,
  'ordered-list-item': (children, { keys }) =>
    `<ol key="${keys.join(',')}">${makeList(children)}</ol>`,
  'unordered-list-item': (children, { keys }) =>
    `<ul key="${keys.join(',')}">${makeList(children)}</ul>`,
};

// render to HTML

const inlineNoJoin = {
  BOLD: children => `<strong>${children}</strong>`,
  ITALIC: children => `<em>${children}</em>`,
  UNDERLINE: children => `<u>${children}</u>`,
  STRIKETHROUGH: children =>
    `<span style=text-decoration:line-through;>${children}</span>`,
};

const entitiesNoJoin = {
  LINK: (children, entity) => `<a href="${entity.url}" >${children}</a>`,
  ENTITY: (children, entity) =>
    `<div style="color: ${entity.data.color}" >${children}</div>`,
};

const blockRenderMap = {
  unstyled: {
    element: 'p',
  },
  blockquote: {
    element: 'blockquote',
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: 'ol',
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: 'ul',
  },
};

const blockCallback = (type, props, ...children) => `<${type} key="${props.key}">${joinRecursively(children)}</${type}>`;

const customBlockRendererFn = createBlockRenderer(blockCallback, blockRenderMap);

const renderersWithKeys = {
  inline,
  blocks: blocksWithKeys,
  entities,
};

const renderersWithCustomMap = {
  inline,
  blocks: customBlockRendererFn,
  entities,
};

const renderersNoJoin = {
  inline: inlineNoJoin,
  blocks,
  entities: entitiesNoJoin,
};

const renderersWithData = {
  inline,
  blocks: dataBlocks,
  entities,
};

describe('redraft', () => {
  test('should render correctly', () => {
    const rendered = redraft(raws.raw, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      '<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em><u><span style=text-decoration:line-through;> dolor</span></u></em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'
    ); // eslint-disable-line max-len
  });
  test('should render blocks with single char correctly', () => {
    const rendered = redraft(raws.raw2, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe('<p>!</p>');
  });
  test('should not mutate input when rendering blocks with depth', () => {
    const before = JSON.stringify(raws.rawWithDepth);
    const rendered = redraft(raws.rawWithDepth, renderers);
    const after = JSON.stringify(raws.rawWithDepth);
    expect(before).toBe(after);
  });
  test('should render blocks with depth correctly 1/2', () => {
    const rendered = redraft(raws.rawWithDepth, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      "<ul><li>Hey<ul><li>Ho<ul><li>Let's</li></ul><ol><li>Go</li></ol></li></ul></li></ul>"
    ); // eslint-disable-line max-len
  });
  test('should render blocks with depth correctly 2/2', () => {
    const rendered = redraft(raws.rawWithDepth2, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      "<ul><li>Hey<ul><li>Ho<ul><li>Let's</li></ul></li></ul></li></ul><ol><li>Go</li></ol>"
    ); // eslint-disable-line max-len
  });
  test('should render blocks containing empty lines', () => {
    const rendered = redraft(raws.rawWithEmptyLine, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe('<p>!!</p>');
  });
  test('should render blocks when first block is empty', () => {
    const rendered = redraft(raws.rawEmptyFirstLine, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe('<p>!</p>');
  });
  test('should render blocks with depth when depth jumps from 0 to 2', () => {
    const rendered = redraft(raws.rawWithDepth3, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      "<ul><li>Hey</li><li>Ho<ul><li>Let's</li></ul></li></ul><ol><li>Go</li></ol>"
    ); // eslint-disable-line max-len
  });
  test('should style last node properly when its after an entity', () => {
    const rendered = redraft(raws.rawStyleWithEntities, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      '<p><strong>This </strong><div style="color: #ee6a56" ><strong>is a </strong></div><div style="color: #ee6a56" ><strong>Greeting</strong></div><div style="color: #ee6a56" ><strong> redraft</strong></div><strong>bug.</strong></p>'
    ); // eslint-disable-line max-len
  });
  test('should render blocks with the block keys', () => {
    const rendered = redraft(raws.raw3, renderersWithKeys);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      '<p key="e047l">Paragraph one</p><blockquote key="520kr,c3taj">A quoteSpanning multiple lines</blockquote><p key="6aaeh">A second paragraph.</p>'
    ); // eslint-disable-line max-len
  });
  test('should render atomic blocks with block metadata', () => {
    const rendered = redraft(raws.rawWithMetadata, renderersWithData);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      '<div key="1" style="width: 300px;" >A</div><img key="2" src="img.png" alt="C" />'
    ); // eslint-disable-line max-len
  });
  test('should render correctly without join', () => {
    const rendered = redraft(raws.raw, renderersNoJoin, { joinOutput: true });
    expect(rendered).toBe(
      '<p><strong>Lorem </strong><a href="http://zombo.com/" ><strong><em>ipsum</em></strong></a><strong><em><u><span style=text-decoration:line-through;> dolor</span></u></em></strong><em> sit amet,</em> pro nisl sonet ad. </p><blockquote>Eos affert numquam id, in est meis nobis. Legimus singulis suscipiantur eum in, <em>ceteros invenire </em>tractatos his id. </blockquote><p><strong>Facer facilis definiebas ea pro, mei malis libris latine an. Senserit moderatius vituperata vis in.</strong></p>'
    ); // eslint-disable-line max-len
  });
  test('should render null for empty raw blocks array', () => {
    const rendered = redraft(raws.emptyRaw, renderers);
    expect(rendered).toBe(null);
  });
  test('should return null for an invalid input 1/2', () => {
    const rendered = redraft(raws.invalidRaw, renderers);
    expect(rendered).toBe(null);
  });
  test('should return null for an invalid input 2/2', () => {
    const rendered = redraft([], renderers);
    expect(rendered).toBe(null);
  });
  test('should return null for no input', () => {
    const rendered = redraft();
    expect(rendered).toBe(null);
  });
  test('should render blocks with renderer from custom map', () => {
    const rendered = redraft(raws.raw3, renderersWithCustomMap);
    const joined = joinRecursively(rendered);
    expect(joined).toBe(
      '<p key="e047l">Paragraph one</p><blockquote key="520kr,c3taj">A quoteSpanning multiple lines</blockquote><p key="6aaeh">A second paragraph.</p>'
    ); // eslint-disable-line max-len
  });
  test('should render blocks with depth and custom map correctly', () => {
    const rendered = redraft(raws.rawWithDepth, renderersWithCustomMap);
    const joined = joinRecursively(rendered);
    // Keys child and parent get same keys as parents have only single child
    expect(joined).toBe(
      '<ul key="eunbc"><li key="eunbc">Hey<ul key="9nl08"><li key="9nl08">Ho<ul key="9qp7i"><li key="9qp7i">Let\'s</li></ul><ol key="1hegu"><li key="1hegu">Go</li></ol></li></ul></li></ul>'
    ); // eslint-disable-line max-len
  });
});
