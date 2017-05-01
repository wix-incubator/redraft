/**
 * This is a simple replacement for draft-js ContentBlock,
 * CharacterList or any related methods are not implented here
 */
const stubContentBlock = block => Object.assign({}, block, {
  get: name => block[name],
  getText: () => block.text,
  getType: () => block.type,
  getKey: () => block.key,
  getLength: () => block.text.length,
  getDepth: () => block.depth,
  getData: () => block.data,
});

export default stubContentBlock;
