export class ContentNode {

  constructor(props) {
    this.content = props.content || [];
    this.endOffset = typeof props.endOffset !== 'undefined' ? props.endOffset : null;
    this.entity = typeof props.entity !== 'undefined' ? props.entity : null;
    this.style = props.style || null;
  }

  getCurrentContent() {
    return this.content[this.content.length - 1];
  }

  addToCurrentContent(string) {
    this.content[this.content.length - 1] = this.content[this.content.length - 1] + string;
  }

  pushContent(item) {
    // we can just concat strings in case when both the pushed item
    // and the last element of the content array is a string
    if (typeof item === 'string' && typeof this.getCurrentContent() === 'string') {
      this.addToCurrentContent(item);
    } else {
      this.content.push(item);
    }
  }

}
