class ContentNode {

  constructor(props) {
    this.content = props.content || [];
    this.start = typeof props.start !== 'undefined' ? props.start : null;
    this.end = typeof props.end !== 'undefined' ? props.end : null;
    this.entity = typeof props.entity !== 'undefined' ? props.entity : null;
    this.decorator = typeof props.decorator !== 'undefined' ? props.decorator : null;
    this.decoratedText = typeof props.decoratedText !== 'undefined' ? props.decoratedText : null;
    this.style = props.style || null;
  }

  getCurrentContent() {
    return this.content[this.content.length - 1];
  }

  addToCurrentContent(string) {
    this.content[this.content.length - 1] = this.content[this.content.length - 1] + string;
  }

  pushContent(string, stack = []) {
    // we can just concat strings in case when both the pushed item
    // and the last element of the content array is a string
    // log
    if (!stack || stack.length < 1) {
      if (typeof string === 'string' && typeof this.getCurrentContent() === 'string') {
        this.addToCurrentContent(string);
      } else {
        this.content.push(string);
      }
      return this;
    }
    const [head, ...rest] = stack;
    const current = this.getCurrentContent();
    if (current instanceof ContentNode && current.style === head) {
      current.pushContent(string, rest);
    } else {
      const newNode = new ContentNode({ style: head });
      newNode.pushContent(string, rest);
      this.content.push(newNode);
    }
    return this;
  }

}

export default ContentNode;
