import { difference, filter } from 'lodash';
import { ContentNode } from './ContentNode';

export default class RawParser {

  // values in haystack must be unique
  containsSome(haystack, needles) {
    return haystack.length > difference(haystack, needles).length;
  }

  relevantStyles(offset) {
    const styles = filter(this.ranges,
      (range) => offset >= range.offset && offset < (range.offset + range.length)
    );
    return styles.map((style) => style.style);
  }

  /**
   * Creates an array of sorted char indexes to avoid iterating over every single character
   */
  getRelevantIndexes(text, inlineRanges, entityRanges = []) {
    let relevantIndexes = [];
    // set indexes to corresponding keys to ensure uniquenes
    relevantIndexes = this.addIndexes(relevantIndexes, inlineRanges);
    relevantIndexes = this.addIndexes(relevantIndexes, entityRanges);
    // add text start and end to relevant indexes
    relevantIndexes.push(0);
    relevantIndexes.push(text.length - 1);
    const uniqueRelevantIndexes = relevantIndexes.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    // and sort it
    return uniqueRelevantIndexes.sort((aa, bb) => (aa - bb));
  }

  addIndexes(indexes, ranges) {
    ranges.forEach((range) => {
      indexes.push(range.offset);
      indexes.push(range.offset + range.length);
      // also add neighbouring chars as relevant
      indexes.push(range.offset - 1);
      indexes.push(range.offset + 1);
      indexes.push(range.offset + range.length - 1);
      indexes.push(range.offset + range.length + 1);
    });
    return indexes;
  }


  /**
   * Iterates over relevant text indexes and calls itself to create nested nodes
   */
  nodeIterator(node, endOffset) {
    // loops while next index is smaller than the endOffset
    for (this.iterator; this.relevantIndexes[this.iterator] < endOffset; this.iterator++) {
      const index = this.relevantIndexes[this.iterator];

      if (index < 0 || index > (this.text.length - 1)) {
        continue;
      }
      // figure out what styles this char and the next char need
      // (regardless of whether there *is* a next char or not)
      const characterStyles = this.relevantStyles(index);
      const nextCharacterStyles = this.relevantStyles(index + 1);

      // calculate styles to add and remove
      const stylesToAdd = difference(characterStyles, this.styleStack);
      this.stylesToRemove = difference(characterStyles, nextCharacterStyles);

      if (stylesToAdd[0]) {
        this.styleStack.push(stylesToAdd[0]);
        // create a nested node if theres a style to add
        node.pushContent(
          this.nodeIterator(new ContentNode({ style: stylesToAdd[0] }), endOffset)
        );
        this.styleStack.pop();
        // close the node if there are styles to remove
        if (this.containsSome(this.styleStack, this.stylesToRemove)) {
          return node;
        }
        // Check if additional escape condition is met
        if (this.relevantIndexes[this.iterator + 1] > endOffset) {
          return node;
        }
        // move on to next character
        continue;
      }
      // push self
      node.pushContent(this.text.substr(index, 1));
      // close the node if there are styles to remove
      if (this.containsSome(this.styleStack, this.stylesToRemove)) {
        return node;
      }
      // calculate distance or set it to 0 if thers no next relevantIndex
      const distance = this.relevantIndexes[this.iterator + 1]
                       ? this.relevantIndexes[this.iterator + 1] - index
                       : 0;
      // we check if there are any chars between current and the next one
      if (distance > 1) {
        // add all the chars up to next relevantIndex
        node.pushContent(this.text.substr(index + 1, distance - 1));
      }
    }
    return node;
  }

  /**
   * creates nodes with entity keys and the endOffset
   */
  createEntityNodes(entityRanges, text) {
    let lastIndex = 0;
    const nodes = [];
    // if thers no entities will return just a single item
    if (entityRanges.length < 1) {
      nodes.push(new ContentNode({ endOffset: text.length }));
      return nodes;
    }

    entityRanges.forEach(range => {
      // create an empty node for content between previous and this entity
      if (range.offset > lastIndex) {
        nodes.push(new ContentNode({ endOffset: range.offset }));
      }
      // push the node for the entity
      nodes.push(new ContentNode({
        entity: range.key,
        endOffset: range.offset + range.length,
      }));
      lastIndex = range.offset + range.length;
    });

    // finaly add a node for the remaining text if any
    if (lastIndex < text.length) {
      nodes.push(new ContentNode({
        endOffset: lastIndex + text.length,
      }));
    }
    return nodes;
  }

  /**
   * Converts raw block to object with nested style objects,
   * while it returns an object not a string
   * the idea is still mostly same as backdraft.js (https://github.com/evanc/backdraft-js)
   */
  parse({ text, inlineStyleRanges: ranges, entityRanges }) {
    this.text = text;
    this.ranges = ranges;
    this.iterator = 0;
    // get all the relevant indexes for whole block
    this.relevantIndexes = this.getRelevantIndexes(text, ranges, entityRanges);
    // create entity or empty nodes to place the inline styles in
    const entityNodes = this.createEntityNodes(entityRanges, text);
    const parsedNodes = entityNodes.map(node => {
      // reset the stacks
      this.styleStack = [];
      this.stylesToRemove = [];
      return this.nodeIterator(node, node.endOffset);
    });
    return new ContentNode({ content: parsedNodes });
  }

}
