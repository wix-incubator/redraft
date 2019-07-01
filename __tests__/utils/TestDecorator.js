/**
 * @flow
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { List } from 'immutable';
import type ContentBlock from 'draft-js/lib/ContentBlock';
import { joinRecursively } from './helpers';
// eslint-disable-next-line import/no-extraneous-dependencies

// Instead of a component return a string for the purpouse of our test,
// additionaly check if props get passed from getPropsForKey
const First = ({ children, testKeyProp }) => `<span style="first ${testKeyProp}" >${joinRecursively(children)}</span>`;

class TestDraftDecorator {
  // eslint-disable-next-line class-methods-use-this
  getDecorations(block: ContentBlock): List<*> {
    const textLenght = block.getText().length;
    const decorations = Array(textLenght).fill(null);
    if (textLenght === 0) {
      // eslint-disable-next-line new-cap
      return List(decorations);
    }
    decorations[0] = `first-${block.getKey()}`;
    // eslint-disable-next-line new-cap
    return List(decorations);
  }

  // eslint-disable-next-line class-methods-use-this
  getComponentForKey(): Function {
    return First;
  }

  // eslint-disable-next-line class-methods-use-this
  getPropsForKey(key: string): ?Object {
    return {
      testKeyProp: key,
    };
  }
}

export default TestDraftDecorator;
