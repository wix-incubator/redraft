
const KEY_DELIMITER = ',';

// Return either a single key if present or joined keys array from props;
const getKey = ({ keys }, key) => {
  if (key) {
    return key;
  }
  if (!keys) {
    return undefined;
  }
  return keys.join(KEY_DELIMITER);
};

// Call the wrapper with element, props, and spread children
// this order is specific to React.createElement
const getBlock = (element, wrapper) => (children, props, key) =>
  wrapper(
    element,
    Object.assign({}, props, { key: getKey(props, key) }),
    ...children
  );

// Handle blocks with wrapper element defined
const getWrappedChildren = (callback, block, { children, props, key }) => {
  const wrapperBlockFn = getBlock(block.wrapper, callback);
  const blockFn = getBlock(block.element, callback);
  return wrapperBlockFn(
    children.map((child, ii) =>
      blockFn(child, {}, props.keys && props.keys[ii])
    ),
    props,
    key
  );
};

/**
* Returns a blockRenderer crated from a blockRendererMap using a callback ie. React.createElement
*/
const createBlockRenderer = (callback, blockMap) => {
  const renderer = {};
  Object.keys(blockMap).forEach((item) => {
    const block = blockMap[item];
    // If wrapper is present children need to be nested inside
    if (block.wrapper) {
      renderer[item] = (children, props, key) => getWrappedChildren(callback, block, {
        children,
        props,
        key,
      });
      return;
    }
    // Wrapper is not present
    renderer[item] = getBlock(block.element, callback);
  });
  return renderer;
};

export default createBlockRenderer;
