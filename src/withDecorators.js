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
  contentState,
  { createContentBlock, Decorator = CompositeDecorator }
) => {
  const decoratorRanges = [];
  // create a Decorator instance
  const decorator = new Decorator(decorators);
  // create ContentBlock or a stub
  const contentBlock = createContentBlock
    ? createContentBlock(block)
    : stubContentBlock(block);
  // Get decorations from CompositeDecorator instance
  const decorations = decorator.getDecorations(contentBlock, contentState).toArray();
  // Keep track of offset for current key
  let offset = 0;
  decorations.forEach((key, index) => {
    // If no key just move the offset
    if (!key) {
      offset += 1;
      return;
    }
    // get next key
    const nextIndex = index + 1;
    const next = decorations[nextIndex];
    // if thers no next key or the key chages build a decoratorRange entry
    if (!next || next !== key) {
      decoratorRanges.push({
        offset,
        length: nextIndex - offset,
        component: decorator.getComponentForKey(key),
        decoratorProps: decorator.getPropsForKey(key) || {},
        // save reference to contentState
        contentState,
      });
      // reset the offset to next index
      offset = nextIndex;
    }
  });
  // merge the block with decoratorRanges
  return Object.assign({}, block, { decoratorRanges });
};

const withDecorators = (raw, decorators, options) => {
  const contentState = options.convertFromRaw
  && options.convertFromRaw(raw);
  return raw.blocks.map(block =>
    decorateBlock(block, decorators, contentState, options || {})
  );
};

export default withDecorators;
