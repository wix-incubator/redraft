import CompositeDecorator from './helpers/CompositeDecorator';
import stubContentBlock from './helpers/stubContentBlock';

/**
 * Use CompositeDecorator to build decoratorRanges with ranges, components, and props
 */

// TODO: Maybe it would be wold be good to check if CompositeDecorator
// is a valid DraftDecoratorType
const decorateBlock = (
  block,
  decorators,
  { createContentBlock, Decorator = CompositeDecorator }
) => {
  const decoratorRanges = [];
  // create a Decorator instance
  const decorator = new Decorator(decorators);
  // create ContentBlock or a stub
  // FIXME: if draf-js is a dependency its possible to just use the built in ContentBlock
  const contentBlock = createContentBlock
    ? createContentBlock(block)
    : stubContentBlock(block);
  // Get decorations from CompositeDecorator instance
  // FIXME: missing contentState for the second argument
  const decorations = decorator.getDecorations(contentBlock, {}).toArray();
  // Keep track of offset for current key
  let offset = 0;
  decorations.forEach((key, index) => {
    // If no key just move the offset
    if (!key) {
      offset += 1;
      return;
    }
    // get next key
    const next = decorations[index + 1];
    // if thers no next key or the key chages build a decoratorRange entry
    if (!next || next !== key) {
      decoratorRanges.push({
        offset,
        length: (index - offset) + 1,
        component: decorator.getComponentForKey(key),
        decoratorProps: decorator.getPropsForKey(key) || {},
      });
      // reset the offset to next index
      offset = index + 1;
    }
  });
  // merge the block with decoratorRanges
  return Object.assign({}, block, { decoratorRanges });
};

const withDecorators = (blocks, decorators, options) =>
  blocks.map(block => decorateBlock(block, decorators, options || {}));

export default withDecorators;
