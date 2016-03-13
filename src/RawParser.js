import { difference, filter } from 'lodash';

export default class RawParser {

  constructor({ text, inlineStyleRanges: ranges }) {
    this.setRelevantIndexes(ranges, text);
    this.text = text;
    this.ranges = ranges;
  }

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
   * Creates an array of soreted char indexes to avoid iterating over every single character
   */
  setRelevantIndexes(ranges, text) {
    const relevantIndexes = []; // its const but its going to be mutated :)

    // set indexes to corresponding keys to ensure uniquenes
    ranges.forEach((range) => {
      relevantIndexes.push(range.offset);
      relevantIndexes.push(range.offset + range.length);
      // also add neighbouring chars as relevant
      relevantIndexes.push(range.offset - 1);
      relevantIndexes.push(range.offset + 1);
      relevantIndexes.push(range.offset + range.length - 1);
      relevantIndexes.push(range.offset + range.length + 1);
    });

    // add text start and end to relevant indexes
    relevantIndexes.push(0);
    relevantIndexes.push(text.length - 1);
    const uniqueRelevantIndexes = relevantIndexes.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    // and sort it
    uniqueRelevantIndexes.sort((aa, bb) => (aa - bb));

    this.relevantIndexes = uniqueRelevantIndexes;
  }


  /**
   * Iterates over relevant text indexes and calls itself to create nested nodes
   */
  nodeIterator(nodeStyle = null) {
    const node = { style: nodeStyle, content: [] };
    for (this.iterator; this.iterator < this.relevantIndexes.length; this.iterator++) {
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
        node.content.push(this.nodeIterator(stylesToAdd[0]));
        this.styleStack.pop();
        // close the node if there are styles to remove
        if (this.containsSome(this.styleStack, this.stylesToRemove)) {
          return node;
        }
        // move on to next character
        continue;
      }
      // push self
      node.content.push(this.text.substr(index, 1));
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
        node.content.push(this.text.substr(index + 1, distance - 1));
      }
    }
    return node;
  }


  /**
   * Converts raw block to object with nested style objects,
   * while it returns an object not a string
   * the idea is still mostly same as backdraft.js (https://github.com/evanc/backdraft-js)
   */
  parse() {
    // reset some calss propeties
    this.styleStack = [];
    this.stylesToRemove = [];
    this.iterator = 0;
    return this.nodeIterator();
  }

}
