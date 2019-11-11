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

/*

    {
      mqttName: "arch1",
      type: "PixelNode",
      animations: [
        {
          color: "red",
          animation: "edges_in",
          duration: 5,
          loopDelay: 10,
          holdTime: 50,
          repeatable: true
        }
      ],
      defaultAnimation: {
        animation: "off"
      }
    },

*/


const show = {
  showName: "showName",
  version: 1,
  startTime: "00:00",
  stopTime: "00:00",
  channels: [],
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      rows: [],
      showName: "",
      channelName: "",
      show: show,
      showExport: false,
    }
  }

  saveShowTimes = (showTimes) => {
    let newShow = this.state.show;
    newShow.startTime = showTimes.startTime;
    newShow.stopTime = showTimes.stopTime;
    this.setState({
      show: newShow
    });
  }

  createShowChannel = (channelIndex, newRow) => {
    return {
      channelIndex: channelIndex,
      mqttName: newRow.channelName,
      type: newRow.channelType,
      animations: [],
    }
  }

  handleAddRow = (newRow) => {
    var showName = this.state.showName;
    let newShow = this.state.show;
    if (newRow.showName) {
      // creating a brand new show and adding our first channel
      showName = newRow.showName;
      newShow.showName = newRow.showName;
    }
    let index = this.state.nextIndex;
    var rowToAdd = (
      <Row key={"row"+index} type={newRow.channelType} channelName={newRow.channelName} />
    );
    let newChannel = this.createShowChannel(index, newRow);
    newShow.channels.push(newChannel);
    this.setState({ 
      nextIndex: index + 1,
      showName: showName,
      channelName: newRow.channelName,
      rows: [...this.state.rows, rowToAdd],
      show: newShow,
      showExport: true,
    });
  }

  handleExport = () => {
    console.log(JSON.stringify(show));
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
          <TitleBar showExportVisible={this.state.showExport} doExport={this.handleExport}  />
          <TimeLineBar title={this.state.showName} saveShowTimes={this.saveShowTimes} />
          <div id="contents-wrapper">
            { contents }
            { addNewRow }
          </div>
        </div>
    )
  }
}

export default App;