
# Redraft
Renders the result of Draft.js convertToRaw using provided callbacks, works well with React

[![Version](https://img.shields.io/npm/v/redraft.svg?style=flat-square)](https://www.npmjs.com/package/redraft)
[![Build Status](https://img.shields.io/travis/lokiuz/redraft/master.svg?style=flat-square)](https://travis-ci.org/lokiuz/redraft)
[![David](https://img.shields.io/david/lokiuz/redraft.svg?style=flat-square)](https://david-dm.org/lokiuz/redraft)

## What does it do?
It can convert whole raw state or just specific parts to desired output like React components or an html string.

Additionally you could just parse the raw using provided RawParser to get a nested structure for a specific block.

## Install
``` sh
$ npm install --save redraft
```
## Demo
A live version of the example source is available [here](http://lokiuz.github.io/redraft/).

## Rendering to React - simplified example
Define all the extra bits:
``` js
/**
 *  You can use inline styles or classNames inside your callbacks
 */
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
};

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map(child => [child, <br />]);

/**
 * Define the renderers
 */
const renderers = {
  /**
   * Those callbacks will be called recursively to render a nested structure
   */
  inline: {
    // The key passed here is just an index based on rendering order inside a block
    BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
    ITALIC: (children, { key }) => <em key={key}>{children}</em>,
    UNDERLINE: (children, { key }) => <u key={key}>{children}</u>,
    CODE: (children, { key }) => <span key={key} style={styles.code}>{children}</span>,
  },
  /**
   * Blocks receive children and depth
   * Note that children are an array of blocks with same styling,
   */
  blocks: {
    unstyled: (children) => children.map(child => <p>{child}</p>),
    blockquote: (children) => <blockquote >{addBreaklines(children)}</blockquote>,
    'header-one': (children) => children.map(child => <h1>{child}</h1>),
    'header-two': (children) => children.map(child => <h2>{child}</h2>),
    // You can also access the original keys of the blocks
    'code-block': (children, { keys }) => <pre style={styles.codeBlock} key={keys[0]} >{addBreaklines(children)}</pre>,
    // or depth for nested lists
    'unordered-list-item': (children, { depth, keys }) => <ul key={keys[keys.length - 1]} class={`ul-level-${depth}`}>{children.map(child => <li>{child}</li>)}</ul>,
    'ordered-list-item': (children, { depth, keys }) => <ol key={keys.join('|')} class={`ol-level-${depth}`}>{children.map((child, index)=> <li key={keys[index]}>{child}</li>)}</ol>,
    // If your blocks use meta data it can also be accessed like keys
    atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i]} {...data[i]} />),
  },
  /**
   * Entities receive children and the entity data
   */
  entities: {
    // key is the entity key value from raw
    LINK: (children, data, { key }) => <Link key={key} to={data.url}>{children}</Link>,
  },
  /**
   * Array of decorators,
   * Entities receive children and the entity data,
   * inspired by https://facebook.github.io/draft-js/docs/advanced-topics-decorators.html
   * it's also possible to pass a custom Decorator class that matches the [DraftDecoratorType](https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js)
   */
  decorators: [
    {
      // by default linkStrategy receives a ContentBlock stub (more info under Creating the ContentBlock)
      // strategy only receives first two arguments, contentState is yet not provided
      strategy: linkStrategy,
      // component - a callback as with other renderers
      // decoratedText a plain string matched by the strategy
      // if your decorator depends on draft-js contentState you need to provide convertFromRaw in redraft options
      component: ({ children, decoratedText }) => <a href={decoratedText}>{children}</a>,
    },
    new CustomDecorator(someOptions),
  ],
}

```

Now what is needed is a simple renderer component to wrap it all.
```js
export default class Renderer extends Component {

  static propTypes = {
    raw: PropTypes.object
  }

  renderWarning() {
    return <div>Nothing to render.</div>;
  }

  render() {
    const { raw } = this.props;
    if (!raw) {
      return this.renderWarning();
    }
    const rendered = redraft(raw, renderers);
    // redraft returns a null if there's nothing to render
    if (!rendered) {
      return this.renderWarning();
    }
    return (
      <div>
        {rendered}
      </div>
    );
  }
}
```

## API
```js
redraft(Object:raw, Object:renderers, Object:options)
```
Returns an array of rendered blocks.
- **raw** - result of the Draft.js convertToRaw
- **renderers** - object with 3 groups of renders inline (or style), blocks and entities refer to example for more info
- **options** - optional settings

#### Using styleMap and blockRenderMap instead of inline and block renders
If provided with a styles renderer in the renders, redraft will use it instead of the inline one. This allows a flatter render more like draft.js does in the editor. Redraft also exposes a helper to create the styles and block renderers.
```js
import React from 'react';
import redraft, { createStylesRenderer, createBlockRenderer } from 'redraft';

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

// This is a wrapper callback for the inline styles
// the style object contains all the relevant styles from the styleMap
// it needs a key as redraft returns arrays not Components
const InlineWrapper = ({ children, style, key }) => <span key={key} style={style}>{children}</span>
// this Component results in a flatter output as it can have multiple styles (also possibly less semantic)

// Api aligned w draft-js, aliasedElements are not required as draft-js uses them for parsing pasted html 
const blockRenderMap = {
  unstyled: {
    element: 'div',
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

const renderers = {
  // note the styles key and createStylesRenderer helper
  styles: createStylesRenderer(InlineWrapper, styleMap),
  blocks: createBlockRenderer(React.createElement, blockRenderMap),
  ...
};
```


## Options
### Cleanup
`cleanup` - cleans up blocks with no text or data (metadata or entities), by default cleanup only removes empty `unstyled` blocks inserted directly after `atomic`. Accepts false or an object containing cleanup settings:
  - `after` - array of block types that are followed by cleanup checks, or `'all'` (default: `['atomic']`)
  - `types` - array of block types that are checked, or `'all'` (default: `['unstyled']`)
  - `except` - array of block types that are omitted during cleanup - passing this is same as setting types to `'all'` (default: `undefined`)
  - `trim` - boolean, should the block text be trimmed when checking if its empty (default: `false`)
  - `split` - boolean, splits groups after cleanup, works best when cleanup is enabled for and after all types - more info in the example (default: `true`)

### Joining the output
`joinOutput` - used when rendering to string, joins the output and the children of all the inline and entity renderers, it expects that all renderers return strings, you still have to join the at block level (default: `false`)


### Render fallback for missing block type
`blockFallback` - redraft will render this block type if its missing a block renderer for a specific type (default: `'unstyled'`)

### Accessing contentState
`convertFromRaw` - pass the draft-js convertFromRaw to provide the contentState object to both the components in your decorators and the custom Decorator class getDecorations method.

### Creating the ContentBlock
 `createContentBlock` - a function that receives a block and returns a draft-js ContentBlock, if not provided when using decorators redraft will create a ContentBlock stub with only some basic ContentBlock functionality

*Example usage with ContentBlock from draft-js*
```js
import { ContentBlock } from 'draft-js'

const createContentBlock = block => new ContentBlock(block)

```

## Common issues 

#### Missing String.fromCodePoint in React Native
Consider using a polyfill like [`String.fromCodePoint`](https://github.com/mathiasbynens/String.fromCodePoint) or [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/)

#### Can the multiple spaces between text be persisted?
Add `white-space: pre-wrap` to a parent div, this way it will preserve spaces and wrap to new lines (as editor js does)

## Changelog
The changelog is available here [CHANGELOG](CHANGELOG.md)

## Credits
- [backdraft-js](https://github.com/evanc/backdraft-js) - For providing a general method of parsing raw state
- [Draft.js](https://facebook.github.io/draft-js) - Well for Draft
