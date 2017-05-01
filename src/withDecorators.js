import stubContentBlock from './helpers/stubContentBlock';

const populateDecoratorRanges = (array, component) => (start, end) => array.push(
  { offset: start, length: end - start, component }
);

/**
 * Calls strategy for each decorator with ContentBlock or its stub
 */
const decorateBlock = (block, decorators, { createContentBlock }) => {
  const decoratorRanges = [];
  // create ContentBlock or a stub
  const contentBlock = createContentBlock ? createContentBlock(block) : stubContentBlock(block);
  decorators.map(({ strategy, component }) => strategy(
    contentBlock,
    populateDecoratorRanges(decoratorRanges, component)
  ));
  return Object.assign({}, block, { decoratorRanges });
};


const withDecorators = (blocks, decorators, options) => blocks.map(
  block => decorateBlock(block, decorators, options || {})
);

export default withDecorators;
