import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import RichEditor from './RichEditor';
import Button from './Button';
import LoadJSON from './LoadJSON';
import Preview from './Preview';
import ForkRibbon from './ForkRibbon';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    const editorState = EditorState.createEmpty();
    const raw = convertToRaw(editorState.getCurrentContent());
    this.state = {
      editorState,
      raw,
    };
  }

  handleUpdate = (editorState) => {
    this.setState({
      editorState,
      raw: convertToRaw(editorState.getCurrentContent()),
      paste: false,
    });
  }

  handleLog = () => {
    console.log(this.state.raw); // eslint-disable-line no-console
  }

  handleLogJSON = () => {
    console.log(JSON.stringify(this.state.raw)); // eslint-disable-line no-console
  }

  handleLoad = (raw) => {
    this.setState({
      editorState: EditorState.createWithContent(convertFromRaw(raw)),
      raw,
      paste: false,
    });
  }

  togglePaste = () => {
    this.setState({
      paste: !this.state.paste,
    });
  }

  render() {
    return (
      <div className="App">
        <ForkRibbon />
        <div className="App-header">
          <h2>Redraft example</h2>
        </div>
        <p className="App-intro">
          Enter some text to see the preview!
        </p>
        <div className="App-editor">
          <RichEditor editorState={this.state.editorState} handleUpdate={this.handleUpdate} />
          <Button label="Log raw state" handleClick={this.handleLog} />
          <Button label="Log raw JSON" handleClick={this.handleLogJSON} />
          <Button label="Paste raw JSON" handleClick={this.togglePaste} />
          {this.state.paste && <LoadJSON handleLoad={this.handleLoad} />}
          <Preview raw={this.state.raw} />
        </div>
        <footer className="App-footer">
          This example is based on draft-js RichEditor example. Made with react-crate-app
        </footer>
      </div>
    );
  }
}

export default App;
