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
import redraft from 'redraft';

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
 * As of 0.3.0 you should pass a single object with all the callbacks
 */
const renderers = {
  /**
   * Those callbacks will be called recursively to render a nested structure
   */
  inline: {
    BOLD: (children) => <strong>{children}</strong>,
    ITALIC: (children) => <em>{children}</em>,
    UNDERLINE: (children) => <u>{children}</u>,
    CODE: (children) => <span style={styles.code}>{children}</span>,
  },
  /**
   * Note that children are an array of blocks with same styling
   */
  blocks: {
    unstyled: (children) => children.map(child => <p>{child}</p>),
    blockquote: (children) => <blockquote>{addBreaklines(children)}</blockquote>,
    'header-one': (children) => children.map(child => <h1>{child}</h1>),
    'header-two': (children) => children.map(child => <h2>{child}</h2>),
    'code-block': (children) => <pre style={styles.codeBlock}>{addBreaklines(children)}</pre>,
    'unordered-list-item': (children) => <ul>{children.map(child => <li>{child}</li>)}</ul>,
    'ordered-list-item': (children) => <ol>{children.map(child => <li>{child}</li>)}</ol>,
  },
  /**
   * For entities what gets passed is children and the entity data
   */
  entities: {
    LINK: (children, data) => <Link to={data.url}>{children}/>,
  },
}

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

## API changes in 0.3.0
Redraft now exports a default function - this is the recommended way to import the render method.
Additionally renderers should now be passed as a single object containing `inline`, `blocks` and `entities`

Previous api is deprecated and will log warnings if `NODE_ENV` is not set to `production`

## API
```js
redraft(Object:raw, Object:renderers)
```
Returns an array of rendered blocks.
- raw - result of the Draft.js convertToRaw
- renderers - object with 3 groups of renders inline, blocks and entities refer to example for more info

```js
RawParser.parse(block)
```
Parses the provided block and returns an ContentNode object

```js
renderNode(Object:node, Object:inlineRendrers, Object:entityRenderers, Object:entityMap)
```
Returns an rendered single block.
- node - ContentNode from `RawParser.parse(block)` method
- inlineRendrers, entityRenderers - callbacks
- entityMap - the entityMap from raw state `raw.entityMap`

## Changelog
The changelog is avalible here [CHANGELOG](CHANGELOG.md)


## Credits
- [backdraft-js](https://github.com/evanc/backdraft-js) - For providing a general method of parsing raw state
- [Draft.js](https://facebook.github.io/draft-js) - Well for Draft
