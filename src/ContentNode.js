export class ContentNode {

  constructor(props) {
    this.content = props.content || [];
    this.endOffset = typeof props.endOffset !== 'undefined' ? props.endOffset : null;
    this.entity = typeof props.entity !== 'undefined' ? props.entity : null;
    this.style = props.style || null;
  }

  pushContent(item) {
    this.content.push(item);
  }

}
