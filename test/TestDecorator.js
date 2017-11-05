/**
 * @flow
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import type ContentBlock from 'draft-js/lib/ContentBlock';
import { joinRecursively } from './helpers';

type ListStub = {
  toArray: () => Array<?string>
};

/**
 * Stub an immutable List with toArray method
 */
const listStub = (array: Array<?string>): ListStub => ({
  toArray: () => array,
});

// Instead of a component return a string for the purpouse of our test,
// additionaly check if props get passed from getPropsForKey
const First = ({ children, testKeyProp }) =>
  `<span style="first ${testKeyProp}" >${joinRecursively(children)}</span>`;

class TestDraftDecorator {
  // eslint-disable-next-line class-methods-use-this
  getDecorations(block: ContentBlock): ListStub {
    const textLenght = block.getText().length;
    const decorations = Array(textLenght).fill(null);
    if (textLenght === 0) {
      return listStub(decorations);
    }
    decorations[0] = `first-${block.getKey()}`;
    return listStub(decorations);
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
