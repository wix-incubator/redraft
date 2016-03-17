# Redraft
Renders the result of Draft.js convertToRaw using provided callbacks, works well with React

## What does it do?
It can convert whole raw state or just specific parts to desired output like React components or an html string.

Additionally you could just parse the raw using provided RawPraser to get a nested structure for a specific block.

## Install
``` sh
$ npm install --save redraft
```

## Example rendering to React
``` js
import React, { Component, PropTypes } from 'react';
import { renderRaw } from 'redraft';

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

/**
 * Those callbacks will be called recursively to render a nested structure
 */
const inlineRenderers = {
  BOLD: (children) => <strong>{children}</strong>,
  ITALIC: (children) => <em>{children}</em>,
  UNDERLINE: (children) => <u>{children}</u>,
  CODE: (children) => <span style={styles.code}>{children}</span>,
};

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map(child => [child, <br />]);

/**
 * Note that children are an array of blocks with same styling
 */
const blockRenderers = {
  unstyled: (children) => children.map(child => <p>{child}</p>),
  blockquote: (children) => <blockquote>{addBreaklines(children)}</blockquote>,
  'header-one': (children) => children.map(child => <h1>{child}</h1>),
  'header-two': (children) => children.map(child => <h2>{child}</h2>),
  'code-block': (children) => <pre style={styles.codeBlock}>{addBreaklines(children)}</pre>,
  'unordered-list-item': (children) => <ul>{children.map(child => <li>{child}</li>)}</ul>,
  'ordered-list-item': (children) => <ol>{children.map(child => <li>{child}</li>)}</ol>,
};

/**
 * For entities what gets passed is children and the entity data
 */
const entityRenderers = {
  LINK: (children, data) => <a href={data.url}>{children}</a>,
};

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
    const rendered = renderRaw(raw, inlineRenderers, blockRenderers, entityRenderers);
    // renderRaw returns a null if there's nothing to render
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
renderRaw(Object:raw, Object:inlineRendrers, Object:blockRenderers)
```
Returns an array of rendered blocks.
- raw - result of the Draft.js convertToRaw
- inlineRendrers - object of key => callback pairs, where key is a Draft.js style and callback accepts an array of children
- blockRenderers - similar to inlineRendrers - here each child is a block with same style - see the example for a use case

```js
RawParser.parse(block)
```
Parses the provided block and returns an ContentNode object

```js
renderNode(Object:node, Object:inlineRendrers, Object:entityRenderers, Object:entityMap)
```
Returns an rendered single block.
- node - ContentNode from `RawParser.parse(block)` method
- inlineRendrers, entityRenderers - callback objects
- entityMap - the entityMap from raw state `raw.entityMap`

## Changelog

### 0.2.0
- Added basic entity parsing and the ContentNode class
- Minor fixes

## What's missing / TODO
- Support for 'ordered-list-item' and 'unordered-list-item' with depth
- Change how render callbacks are passed

## Credits
- [backdraft-js](https://github.com/evanc/backdraft-js) - For providing a general method of parsing raw state
- [Draft.js](https://facebook.github.io/draft-js) - Well for Draft
