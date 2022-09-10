/*
PiLit GUI - a web tool for creating PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License

*/

import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
  exportShow,
  getSavedShowList,
  getShowByName,
  saveShow,
} from "./lib/storage";

import TitleBar from "./components/titlebar";
import TimeLineBar from "./components/timelinebar";
import Channel from "./components/channel";
import EmptyShow from "./components/emptyshow";
import AddChannel from "./components/addchannel";
import Stage from "./components/stage";
import ShowDetails from "./components/showdetails";

const showTemplate = {
  showName: "",
  version: 1,
  startTime: "00:00",
  stopTime: "01:00",
  channels: [],
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      channels: [],
      showName: "",
      show: showTemplate,
      showExport: false,
      totalDuration: 0,
    };
  }

  componentDidMount() {
    this.checkAndLoadSavedShows();
  }

  saveShowTimes = (showTimes) => {
    // passed to, and called from timlinebar.js to save the show times
    let newShow = this.state.show;
    if (!newShow) return;
    newShow.startTime = showTimes.startTime;
    newShow.stopTime = showTimes.stopTime;
    this.setState({
      show: newShow,
    });
    this.handleSave();
  };

  handleAddAnimation = (animObj) => {
    // Save an animation to a channel's list of animations
    // Called from channel.js
    // console.log(`animObj: ${JSON.stringify(animObj)}`);
    // console.log(`channels: ${JSON.stringify(this.state.show.channels)}`);
    let channelIndex = this.state.show.channels.findIndex(
      (item) => item.mqttName === animObj.mqttName
    );
    if (channelIndex === -1) {
      console.log("MQTT channel not found, bail out...");
      return;
    }
    // Remove various fields from original object with destructuring & spread operator
    const { show, nodeText, animationIndex, mqttName, type, ...subset } =
      animObj;
    let tmpShow = this.state.show;
    // check to see if the anim already exists in the array
    let nodeIndex = tmpShow.channels[channelIndex].animations.findIndex(
      (item) => item.nodeIndex == subset.nodeIndex
    );
    if (nodeIndex === -1) {
      // not found, so add it
      tmpShow.channels[channelIndex].animations.push(subset);
    } else {
      // found, replace it to update it
      tmpShow.channels[channelIndex].animations[nodeIndex] = subset;
    }
    this.setState({ show: tmpShow });
    this.handleSave();
  };

  handleRemoveAnimation = (animObj) => {
    // Remove an animation to a channel's list of animations
    // Called from channel.js
    let channelIndex = this.state.show.channels.findIndex(
      (item) => item.mqttName === animObj.mqttName
    );
    if (channelIndex === -1) {
      console.log("MQTT channel not found, bail out...");
      return;
    }
    let tmpShow = this.state.show;
    let nodeIndex = tmpShow.channels[channelIndex].animations.findIndex(
      (item) => item.nodeIndex == animObj.nodeIndex
    );
    if (nodeIndex > -1) {
      tmpShow.channels[channelIndex].animations.splice(nodeIndex, 1);
      this.setState({ show: tmpShow });
      this.handleSave();
    }
  };

  createShowChannel = (channelIndex, newChannel) => {
    // Create a JavaScript object version of a <Row> which is stored in `show`
    // and used in the final exported show file
    return {
      channelIndex: channelIndex,
      channelName: newChannel.channelName,
      mqttName: newChannel.mqttName,
      type: newChannel.channelType,
      animations: [],
    };
  };

  handleAddChannel = (newChannel) => {
    // First check if we're adding an audio channel when there's already
    // one in the show (only single audio track supported)
    let showHasAudioChannel = this.hasAudioChannel();
    if (showHasAudioChannel && newChannel.channelType === "AudioChannel") {
      alert("You cannot have multiple audio tracks in a show. Sorry.");
      return;
    }
    // Adds a <Channel> which gets rendered to the page. This function
    // also updates the `show` object which is used in the final exported show
    var showName = this.state.showName;
    let newShow = this.state.show;
    if (newChannel.showName) {
      // If the `newChannel` has a showName value, then we are
      // creating a brand new show and adding our first channel
      showName = newChannel.showName;
      newShow.showName = newChannel.showName;
    }
    let index = showHasAudioChannel ? this.state.nextIndex : 0; // audio always first
    newChannel.channelName = newChannel.channelName.replace(/\s+/g, "");
    var channelToAdd = (
      <Channel
        key={"channel" + index}
        type={newChannel.channelType}
        channelName={newChannel.channelName}
        mqttName={newChannel.mqttName}
        handleAddAnimation={this.handleAddAnimation}
        handleRemoveAnimation={this.handleRemoveAnimation}
      />
    );
    let channelToCreate = this.createShowChannel(index, newChannel);
    let nextIndex = index + 1;
    // now add it to the channels array, audio channel goes first
    if (showHasAudioChannel) {
      newShow.channels.unshift(channelToCreate);
      newShow.channels = this.renumberChannels(newShow.channels);
    } else {
      newShow.channels.push(channelToCreate);
    }
    this.setState({
      nextIndex: nextIndex,
      showName: showName,
      channels: [...this.state.channels, channelToAdd],
      show: newShow,
      showExport: true,
    });
    this.handleSave();
  };

  handleSave = () => {
    saveShow(this.state.show);
  };

  hasAudioChannel = () => {
    const isAudioChannel = (channel) => channel.type === "AudioChannel";
    return this.state.show.channels.some(isAudioChannel);
  };

  renumberChannels = (channels) => {
    const renumber = (channel, idx) => (channel.channelIndex = "channel" + idx);
    channels.forEach(renumber);
  };

  checkAndLoadSavedShows = () => {
    const showToImport = this.state.show.showName;
    this.handleImport(getShowByName(showToImport));
  };

  handleExport = () => {
    // Export the show to a JSON file to be used by the accompanying player
    // Called from titlebar.js
    if (this.state.show.startTime === this.state.show.stopTime) {
      alert(
        "You can't set start and stop times to the same value. Did you forget to set them?"
      );
      return;
    }
    exportShow(this.state.show);
  };

  makeRowForImport = (newChannel, index, showName) => {
    // Creates a <Row> when importing a show file
    var channelToAdd = (
      <Channel
        key={"channel" + index}
        type={newChannel.type}
        channelName={newChannel.channelName || newChannel.mqttName}
        mqttName={newChannel.mqttName}
        handleAddAnimation={this.handleAddAnimation}
        handleRemoveAnimation={this.handleRemoveAnimation}
        animationsFromImport={newChannel.animations}
      />
    );
    return channelToAdd;
  };

  handleImport = (showContents) => {
    // Process an imported show JSON file. Called from titlebar.js
    console.log(showContents);
    if (!showContents) return;
    let newShow = {};
    if (!showContents.show) {
      newShow = showContents;
    } else {
      newShow = showContents.show;
    }
    try {
      if (!newShow.channels) {
        newShow.channels = [];
      }
      let newRows = newShow.channels.map((chnnl, index) => {
        return this.makeRowForImport(chnnl, index);
      });
      this.setState({
        nextIndex: newShow.channels.length,
        channels: newRows,
        showName: newShow.showName,
        show: newShow,
        showExport: true,
      });
    } catch (e) {
      console.log(e);
    }
  };

  handleClearShow = () => {
    this.setState({
      nextIndex: 0,
      channels: [],
      showName: "",
      show: showTemplate,
      showExport: false,
      totalDuration: 0,
    });
  };

  render() {
    var channels = null;
    var addNewChannel = null;
    var emptyShow = null;
    if (this.state.channels.length > 0) {
      channels = this.state.channels;
      addNewChannel = (
        <AddChannel
          handleAddNewChannel={this.handleAddChannel}
          hasAudioChannel={this.hasAudioChannel}
        />
      );
    } else {
      emptyShow = (
        <EmptyShow
          handleAddNewChannel={this.handleAddChannel}
          hasAudioChannel={this.hasAudioChannel}
        />
      );
    }

    return (
      <div className="App">
        <Container
          fluid="true"
          style={{
            width: "100%",
            marginTop: "35pt",
            marginLeft: "0",
          }}
        >
          <Row>
            <Col>
              <TitleBar
                showExportVisible={this.state.showExport}
                doExport={this.handleExport}
                doImport={this.handleImport}
                doClearShow={this.handleClearShow}
              />
            </Col>
          </Row>
          <Row id="show-stage-wrapper">
            <Col xs={2}>
              <ShowDetails show={this.state.show}></ShowDetails>
            </Col>
            <Col>
              <Stage show={this.state.show} />
            </Col>
          </Row>
          <Row>
            <Col>
              <div id="contents-wrapper">
                <TimeLineBar
                  show={this.state.show}
                  saveShowTimes={this.saveShowTimes}
                />
                {channels}
                {addNewChannel}
              </div>
              {emptyShow}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
