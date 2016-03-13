import RawParser from './RawParser';


/**
 * Concats or insets a string at given array index
 */
const pushString = (string, array, index) => {
  const tempArray = array;
  if (!array[index]) {
    tempArray[index] = string;
  } else {
    tempArray[index] += string;
  }
  return tempArray;
};

/**
 * Recursively renders a node with nested nodes with given callbacks
 */
export const renderNode = (node, styleRendrers) => {
  let children = [];
  let index = 0;
  node.content.forEach((part) => {
    if (typeof part === 'string' || part instanceof String) {
      children = pushString(part, children, index);
    } else {
      index++;
      children[index] = renderNode(part, styleRendrers);
      index++;
    }
  });
  if (styleRendrers[node.style]) {
    return styleRendrers[node.style](children);
  }
  return children;
};


/**
 * Renders blocks grouped by type using provided blockStyleRenderers
 */
const renderBlocks = (blocks, inlineRendrers = {}, blockRenderers = {}) => {
  // initialize
  const rendered = [];
  let group = [];
  let prevType = null;
  blocks.forEach((block) => {
    const node = new RawParser(block).parse();
    const renderedNode = renderNode(node, inlineRendrers);
    // if type of the block has changed render the block and clear group
    if (prevType && prevType !== block.type) {
      if (blockRenderers[prevType]) {
        rendered.push(blockRenderers[prevType](group));
      } else {
        rendered.push(group);
      }
      group = [];
    }
    // push current node to group
    group.push(renderedNode);
    // lastly save current type for refference
    prevType = block.type;
  });
  // render last group
  if (blockRenderers[prevType]) {
    rendered.push(blockRenderers[prevType](group));
  } else {
    rendered.push(group);
  }
  return rendered;
};

/**
 * Converts and renders each block of Draft.js rawState
 */
export const renderRaw = (raw, inlineRendrers = {}, blockRenderers = {}) => {
  const blocks = raw.blocks;
  if (!blocks || blocks[0].text.length === 0) {
    return null;
  }
  return renderBlocks(blocks, inlineRendrers, blockRenderers);
};
