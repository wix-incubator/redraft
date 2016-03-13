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
 * Note that block callbacks receive an array of blocks with same styling
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
    const rendered = renderRaw(raw, inlineRenderers, blockRenderers);
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
### `renderRaw(Object:raw, Object:inlineRendrers, Object:blockRenderers)`
Returns an array of rendered blocks.
- raw - result of the Draft.js convertToRaw
- inlineRendrers - object of key => callback pairs, where key is a Draft.js style and callback accepts an array of children
- inlineRendrers - similar to inlineRendrers - here each child is a block with same style - see the example for a use case

### `new RawPraser(Object: block)`
Initialize a new raw parser with a single block
- block - single element of Drafts raw.blocks

### `RawPraser.parse()`
Parses the provided block and returns an nested node object

### `renderNode(Object:node, Object:inlineRendrers)`
Returns an rendered single block.
- node - result of the RawPraser.parse()


## What's missing / TODO
- Entities
- Support for 'ordered-list-item' and 'unordered-list-item' with depth
- Consider dropping the lodash dependecy

## Credits
- [backdraft-js](https://github.com/evanc/backdraft-js)
- [Draft.js](https://facebook.github.io/draft-js)
