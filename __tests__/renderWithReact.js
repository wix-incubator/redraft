import React, { Fragment } from 'react';
import renderer from 'react-test-renderer';
import redraft from '../src';
import * as raws from './utils/raws';
import createBlockRenderer from '../src/createBlockRenderer';
import createStylesRenderer from '../src/createStyleRenderer';

const styles = {
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 20,
  },
  strikethrough: {
    textDecoration: 'line-through',
  },
};

// just a helper to add a <br /> after a block except the last one
const addBreaklines = (children, keys) =>
  children.map((child, ii) => (
    <Fragment key={keys[ii]}>
      {child}
      {ii < children.length - 1 && <br />}
    </Fragment>
  ));

const inline = {
  // The key passed here is just an index based on rendering order inside a block
  BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
  ITALIC: (children, { key }) => <em key={key}>{children}</em>,
  UNDERLINE: (children, { key }) => <u key={key}>{children}</u>,
  CODE: (children, { key }) => (
    <span key={key} style={styles.code}>{children}</span>
  ),
  STRIKETHROUGH: (children, { key }) => (
    <span key={key} style={styles.strikethrough}>{children}</span>
  ),
};

const blocks = {
  unstyled: (children, { keys }) => (
    <p key={keys[0]}>
      {addBreaklines(children, keys)}
    </p>
  ),
  blockquote: (children, { keys }) => (
    <blockquote key={keys[0]}>{addBreaklines(children, keys)}</blockquote>
  ),
  'header-one': (children, { keys }) =>
    children.map((child, i) => <h1 key={keys[i]}>{child}</h1>),
  'header-two': (children, { keys }) =>
    children.map((child, i) => <h2 key={keys[i]}>{child}</h2>),
  'header-three': (children, { keys }) =>
    children.map((child, i) => <h3 key={keys[i]}>{child}</h3>),
  'header-four': (children, { keys }) =>
    children.map((child, i) => <h4 key={keys[i]}>{child}</h4>),
  'header-five': (children, { keys }) =>
    children.map((child, i) => <h5 key={keys[i]}>{child}</h5>),
  'header-six': (children, { keys }) =>
    children.map((child, i) => <h6 key={keys[i]}>{child}</h6>),
  'code-block': (children, { keys }) => (
    <pre style={styles.codeBlock} key={keys[0]}>
      {addBreaklines(children, keys)}
    </pre>
  ),
  // or depth for nested lists
  'unordered-list-item': (children, { depth, keys }) => (
    <ul key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
      {children.map((child, index) => <li key={keys[index]}>{child}</li>)}
    </ul>
  ),
  'ordered-list-item': (children, { depth, keys }) => (
    <ol key={keys.join('|')} className={`ol-level-${depth}`}>
      {children.map((child, index) => <li key={keys[index]}>{child}</li>)}
    </ol>
  ),
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

const customBlockRendererFn = createBlockRenderer(
  React.createElement,
  blockRenderMap
);

const styleMap = {
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

const InlineWrapper = ({ children, style, key }) => (
  <span key={key} style={style}>{children}</span>
);
// this Component results in a flatter output as it can have multiple styles (also possibly less semantic)

const Renderer = ({ renderers, raw, options }) => (
  <div>{redraft(raw, renderers, options)}</div>
);

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.raw}
        renderers={{
          inline,
          blocks,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders blocks with single char correctly', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.raw2}
        renderers={{
          inline,
          blocks,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders blocks with depth correctly 1/2', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.rawWithDepth}
        renderers={{
          inline,
          blocks,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders blocks with depth correctly 2/2', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.rawWithDepth2}
        renderers={{
          inline,
          blocks,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders blocks with renderer from custom map', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.raw3}
        renderers={{
          inline,
          blocks: customBlockRendererFn,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders blocks with depth from custom map correctly 1/2', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.rawWithDepth}
        renderers={{
          inline,
          blocks: customBlockRendererFn,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders unstyled block by default if current block type is unsuported', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.unsportedType}
        renderers={{
          inline,
          blocks,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders provided fallback block if current block type is unsuported', () => {
  const tree = renderer
    .create(
      <Renderer
        raw={raws.unsportedType}
        renderers={{
          inline,
          blocks,
        }}
        options={{
          blockFallback: 'blockquote',
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders same length inlineStyles correctly', () => {
  const tree = renderer.create(
    <Renderer
      raw={raws.rawWithDuplicateStyles}
      renderers={{
        styles: createStylesRenderer(InlineWrapper, styleMap),
        blocks,
      }}
    />
  );
  expect(tree.root.findAllByType('span')[0].children).toEqual([
    'Lorem ',
  ]);
  expect(tree.root.findAllByType('span')[1].children).toEqual([
    'ipsum.',
  ]);
  expect(tree.toJSON()).toMatchSnapshot();
});
