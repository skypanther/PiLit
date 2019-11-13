/*
PiLit GUI - a web tool for creating PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License

TODO:
 - Either finish Save button functionality (save to localstorage, load from there)
    or, build an import function instead (to import a previously exported show JSON file)
 - Add checks for required data -- like when creating a row, you must supply values for all fields
 - Prompt for start/stop times if you try to export without having set them
 - Edit row functionality -- change the mqtt name

Node changes:
 - Update pixel_node to use the repeatable boolean (so that an animation can run once)
 - Add more animation functions for pixel_nodes
 - Create the MetaTree node animations (Raspberry Pi / Python)

Future:
 - Add a show previewer (using CSS, JS, or Canvas animations)
 - Create an ESP8266/Arduino version of the MegaTree node type
 - Add a music player / FM broadcast node type
*/

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
]

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

  handleAddAnimation = (animObj) => {
    // Save an animation to a channel's list of animations
    // Called from row.js

    let channelIndex = this.state.show.channels.findIndex(item => item.mqttName === animObj.mqttName);
    if (channelIndex === -1) {
      console.log('MQTT channel not found, bail out...');
      return;
    }
    // Remove various fields from original object with destructuring & spread operator
    const {show, nodeText, animationIndex, mqttName, type, ...subset} = animObj;
    let tmpShow = this.state.show;
    // check to see if the anim already exists in the array
    let nodeIndex = tmpShow.channels[channelIndex].animations.findIndex(item => item.nodeIndex == subset.nodeIndex);
    if (nodeIndex === -1) {
      // not found, so add it
      tmpShow.channels[channelIndex].animations.push(subset);
    } else {
      // found, replace it to update it
      tmpShow.channels[channelIndex].animations[nodeIndex] = subset;
    }
    this.setState({show: tmpShow});
  }

  handleRemoveAnimation = (animObj) => {
    let channelIndex = this.state.show.channels.findIndex(item => item.mqttName === animObj.mqttName);
    if (channelIndex === -1) {
      console.log('MQTT channel not found, bail out...');
      return;
    }
    let tmpShow = this.state.show;
    let nodeIndex = tmpShow.channels[channelIndex].animations.findIndex(item => item.nodeIndex == animObj.nodeIndex);
    if (nodeIndex > -1) {
      tmpShow.channels[channelIndex].animations.splice(nodeIndex, 1);
      this.setState({show: tmpShow});
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
    newRow.channelName = newRow.channelName.replace(/\s+/g, "")
    var rowToAdd = (
      <Row key={"row"+index}
        type={newRow.channelType}
        channelName={newRow.channelName}
        handleAddAnimation={this.handleAddAnimation}
        handleRemoveAnimation={this.handleRemoveAnimation} />
    );
    let newChannel = this.createShowChannel(index, newRow);
    newShow.channels.push(newChannel);
    this.setState({ 
      nextIndex: index + 1,
      showName: showName,
      rows: [...this.state.rows, rowToAdd],
      show: newShow,
      showExport: true,
    });
  }

  handleExport = () => {
    // console.log(JSON.stringify(show));
    let filename = this.state.showName + ".json";
    let contentType = "application/json;charset=utf-8;";
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
       var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(show)))], { type: contentType });
       navigator.msSaveOrOpenBlob(blob, filename);
     } else {
       var a = document.createElement('a');
       a.download = filename;
       a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(show));
       a.target = '_blank';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
     }
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