import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { MegadraftEditor, editorStateFromRaw } from 'megadraft';
import Button from '../Button/Button';
import LoadJSON from '../LoadJSON/LoadJSON';
import Preview from '../Preview/Preview';
import ForkRibbon from '../ForkRibbon/ForkRibbon';
import sample from '../sample';
import './App.css';
import '../../node_modules/megadraft/dist/css/megadraft.css';

class App extends Component {

  constructor(props) {
    super(props);
    // HACK: when using the
    const editorState = editorStateFromRaw(sample);
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

  handleSample = () => {
    this.setState({
      editorState: EditorState.createWithContent(convertFromRaw(sample)),
      raw: sample,
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
        {/* <p className="App-intro">IDEA: consider some basic instructions</p> */}
        <div className="App-column">
          <div className="App-label">live preview</div>
          <Preview raw={this.state.raw} />
        </div>
        <div className="App-column">
          <div className="App-label">editor</div>
          <MegadraftEditor editorState={this.state.editorState} onChange={this.handleUpdate} />
          <Button label="Log raw state" handleClick={this.handleLog} />
          <Button label="Log raw JSON" handleClick={this.handleLogJSON} />
          <Button label="Paste raw JSON" handleClick={this.togglePaste} />
          <Button label="Reload sample data" handleClick={this.handleSample} />
          {this.state.paste && <LoadJSON handleLoad={this.handleLoad} />}
        </div>
        <footer className="App-footer">
          The editor in this example is powered by awesome <a href="https://github.com/globocom/megadraft">megadraft</a>
        </footer>
      </div>
    );
  }
}

export default App;
