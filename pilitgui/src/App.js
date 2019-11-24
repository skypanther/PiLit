/*
PiLit GUI - a web tool for creating PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License

*/

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import TitleBar from './components/titlebar';
import TimeLineBar from './components/timelinebar';
import Row from './components/row';
import EmptyShow from './components/emptyshow';
import AddChannel from './components/addchannel';

const showTemplate = {
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
      show: showTemplate,
      showExport: false,
    }
  }

  saveShowTimes = (showTimes) => {
    // passed to, and called from timlinebar.js to save the show times
    let newShow = this.state.show;
    newShow.startTime = showTimes.startTime;
    newShow.stopTime = showTimes.stopTime;
    this.setState({
      show: newShow
    });
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
    // Remove an animation to a channel's list of animations
    // Called from row.js
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

  createShowChannel = (channelIndex, newRow) => {
    // Create a JavaScript object version of a <Row> which is stored in `show`
    // and used in the final exported show file
    return {
      channelIndex: channelIndex,
      mqttName: newRow.channelName,
      type: newRow.channelType,
      animations: [],
    }
  }

  handleAddRow = (newRow) => {
    // Adds a <Row> (aka a channel) which gets rendered to the page. This function
    // also updates the `show` object which is used in the final exported show
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
    // Export the show to a JSON file to be used by the accompanying player
    // Called from titlebar.js
    if (this.state.show.startTime === this.state.show.stopTime) {
      alert("You can't set start and stop times to the same value. Did you forget to set them?");
      return;
    }
    let filename = this.state.showName + ".json";
    let contentType = "application/json;charset=utf-8;";
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
       var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(this.state.show)))], { type: contentType });
       navigator.msSaveOrOpenBlob(blob, filename);
     } else {
       var a = document.createElement('a');
       a.download = filename;
       a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(this.state.show));
       a.target = '_blank';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
     }
  }

  makeRowForImport = (newRow, index, showName) => {
    // Creates a <Row> when importing a show file
    var rowToAdd = (
      <Row key={"row"+index}
        type={newRow.type}
        channelName={newRow.mqttName}
        handleAddAnimation={this.handleAddAnimation}
        handleRemoveAnimation={this.handleRemoveAnimation}
        animationsFromImport={newRow.animations} />
    );
    return rowToAdd;
  }

  handleImport = (showContents) => {
    // Process an imported show JSON file. Called from titlebar.js
    try {
      let newShow = JSON.parse(showContents);
      let newRows = newShow.channels.map((chnnl, index) => {
        return this.makeRowForImport(chnnl, index, newShow.showName)
      })
      this.setState({
        nextIndex: newShow.channels.length,
        rows: newRows,
        showName: newShow.showName,
        show: newShow,
        showExport: true,
      })
    } catch (e) {
      console.log(e)
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
          <TitleBar showExportVisible={this.state.showExport} doExport={this.handleExport} doImport={this.handleImport} />
          <TimeLineBar show={this.state.show} saveShowTimes={this.saveShowTimes} />
          <div id="contents-wrapper">
            { contents }
            { addNewRow }
          </div>
        </div>
    )
  }
}

export default App;