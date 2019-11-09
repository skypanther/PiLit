import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import TitleBar from './components/titlebar';
import TimeLineBar from './components/timelinebar';
import Row from './components/row';
import EmptyShow from './components/emptyshow';
import AddChannel from './components/addchannel';

const nodeTypes = [
  { label: "RGB Pixel Node", value: "PixelNode" },
  { label: "On / Off (spotlight) Node", value: "OnOffNode" },
  { label: "Mega Tree (multi-relay)", value: "MegaTree" },
  { label: "Pixel Tree", value: "PixelTree" },
]


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      rows: [],
      showName: "",
      channelName: "",
    }
  }

  handleAddRow = (newRow) => {
    var showName = this.state.showName;
    if (newRow.showName) {
      // creating a brand new show and adding our first channel
      showName = newRow.showName;
    }
    let index = this.state.nextIndex;
    var newRow = (
      <Row key={"row"+index} type={newRow.channelType} channelName={newRow.channelName} />
    );
    this.setState({ 
      nextIndex: index + 1,
      showName: showName,
      channelName: newRow.channelName,
      rows: [...this.state.rows, newRow]
    });

  }


  render() {
    var contents;
    var addNewRow = null;
    if (this.state.rows.length > 0) {
      contents = this.state.rows;
      addNewRow = (<AddChannel handleAddNewRow={this.handleAddRow} />);
    } else {
      contents = (<EmptyShow handleAddNewRow={this.handleAddRow} />);
    }


    return (
        <div className="App">
          <TitleBar />
          <TimeLineBar title={this.state.showName} />
          <div id="contents-wrapper">
            { contents }
            { addNewRow }
          </div>
        </div>
    )
  }
}

export default App;