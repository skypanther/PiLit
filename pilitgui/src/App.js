/*
PiLit GUI - a web tool for creating PiLit light show sequences

(c) 2019 Tim Poulsen
MIT License

*/

import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

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

const makeShowTemplate = () => {
  return {
    showName: "",
    version: 1,
    startTime: "00:00",
    stopTime: "01:00",
    channels: [],
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      channels: [],
      showName: "",
      show: makeShowTemplate(),
      showExport: false,
      totalDuration: 0,
      showEdit: false,
      editChannelIndex: null,
      editChannelName: null,
      editChannelMqttName: null,
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
    // Remove various fields from original object with destructuring & spread operator
    const { show, nodeText, animationIndex, mqttName, type, ...subset } =
      animObj;
    if (subset.hasOwnProperty("waveformId")) {
      // For audio nodes, we want the file name to be in the filename prop, not
      // animation. So, sniff and stuff here
      subset.filename = subset.animation;
    }
    let tmpShow = this.state.show;
    // check to see if the anim already exists in the array
    let nodeIndex = tmpShow.channels[animObj.channelIndex].animations.findIndex(
      (item) => item.nodeIndex == subset.nodeIndex
    );
    if (nodeIndex === -1) {
      // not found, so add it
      tmpShow.channels[animObj.channelIndex].animations.push(subset);
    } else {
      // found, replace it to update it
      tmpShow.channels[animObj.channelIndex].animations[nodeIndex] = subset;
    }
    this.setState({ show: tmpShow });
    this.handleSave();
  };

  handleRemoveAnimation = (animObj, channelIndex) => {
    // Called from the nodes with:
    //     this.props.removeNode(this.state, this.props.channelIndex);
    // Remove an animation to a channel's list of animations
    // Called from channel.js
    let tmpShow = this.state.show;
    if (animObj.nodeIndex > -1) {
      tmpShow.channels[channelIndex].animations.splice(animObj.nodeIndex, 1);
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
    if (showHasAudioChannel && newChannel.channelType === "AudioNode") {
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
        key={"channel" + Math.random()}
        index={index}
        type={newChannel.channelType}
        channelName={newChannel.channelName}
        mqttName={newChannel.mqttName}
        handleAddAnimation={this.handleAddAnimation}
        handleRemoveAnimation={this.handleRemoveAnimation}
        handleChannelEdit={this.handleChannelEdit}
        handleDuplicateChannel={this.handleDuplicateChannel}
        channelIndex={index}
      />
    );
    let channelToCreate = this.createShowChannel(index, newChannel);
    let nextIndex = index + 1;
    let updatedStateChannels = [];
    // now add it to the channels array, audio channel goes first
    if (newChannel.channelType === "AudioNode") {
      newShow.channels.unshift(channelToCreate);
      newShow.channels = this.renumberChannels(newShow.channels);
      updatedStateChannels = [channelToAdd, ...this.state.channels];
      updatedStateChannels = this.renumberChannels(updatedStateChannels);
    } else {
      newShow.channels.push(channelToCreate);
      updatedStateChannels = [...this.state.channels, channelToAdd];
    }
    this.setState({
      nextIndex: nextIndex,
      showName: showName,
      channels: updatedStateChannels,
      show: newShow,
      showExport: true,
    });
    this.handleSave();
  };

  handleDeleteChannel = (index) => {
    let newShow = this.state.show;
    // state.show.channels is an array of JS objects
    let newShowChannels = [...this.state.show.channels];
    // state.channels is an array of React elements
    let newStateChannels = [...this.state.channels];
    newShowChannels.splice(index, 1);
    newStateChannels.splice(index, 1);
    newShowChannels = this.renumberChannels(newShowChannels);
    newShow.channels = newShowChannels;
    let nextIndex = newShowChannels.length;
    this.setState({
      nextIndex: nextIndex,
      channels: newStateChannels,
      show: newShow,
    });
    this.handleSave();
  };

  handleSave = () => {
    saveShow(this.state.show);
  };

  hasAudioChannel = () => {
    const isAudioChannel = (channel) => channel.type === "AudioNode";
    return this.state.show.channels.some(isAudioChannel);
  };

  renumberChannels = (channels) => {
    const renumberChannel = (channel, idx) => {
      channel.channelIndex = idx;
      channel.animations.forEach((animation) => (animation.channelIndex = idx));
      return channel;
    };
    channels.forEach(renumberChannel);
    return channels;
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
        handleDeleteChannel={this.handleDeleteChannel}
        handleDuplicateChannel={this.handleDuplicateChannel}
        handleChannelEdit={this.handleChannelEdit}
        animationsFromImport={newChannel.animations}
        channelIndex={index}
      />
    );
    return channelToAdd;
  };

  handleImport = (showContents) => {
    // Process an imported show JSON file. Called from titlebar.js
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
      let newRows = newShow.channels.map((channel, index) => {
        return this.makeRowForImport(channel, index);
      });
      newShow.channels.forEach((channel, index) => {
        channel.channelIndex = index;
        channel.animations.forEach((anim) => {
          anim.channelIndex = index;
        });
      });
      this.setState({
        nextIndex: newShow.channels.length,
        channels: newRows,
        showName: newShow.showName,
        show: newShow,
        showExport: true,
      });
      this.handleSave();
    } catch (e) {
      console.log(e);
    }
  };

  handleClearShow = () => {
    this.setState({
      nextIndex: 0,
      channels: [],
      showName: "",
      show: makeShowTemplate(),
      showExport: false,
      totalDuration: 0,
    });
    this.handleSave();
  };

  handleChannelEdit = (channelIndex, channelName, mqttName) => {
    // Displays the Edit Channel modal
    this.setState({
      showEdit: true,
      editChannelIndex: channelIndex,
      editChannelName: channelName,
      editChannelMqttName: mqttName,
    });
  };

  handleCloseEdit = () => {
    // Closes the Edit Channel modal
    this.setState({
      showEdit: false,
      editChannelIndex: null,
      editChannelName: null,
      editChannelMqttName: null,
    });
  };

  handleSaveEdit = () => {
    // Saves an edited channel
    let updatedShow = this.state.show;
    updatedShow.channels[this.state.editChannelIndex].channelName =
      this.state.editChannelName;
    updatedShow.channels[this.state.editChannelIndex].mqttName =
      this.state.editChannelMqttName;
    this.setState({
      showEdit: false,
      show: updatedShow,
      editChannelIndex: null,
      editChannelName: null,
      editChannelMqttName: null,
    });
    this.handleSave();
    this.checkAndLoadSavedShows();
  };

  setEditChannelName = (newName) => {
    this.setState({
      editChannelName: newName,
    });
  };
  setEditMqttName = (newMqttName) => {
    this.setState({
      editChannelMqttName: newMqttName,
    });
  };

  handleDuplicateChannel = (channelIndex) => {
    /* 
    Duplicates a channel, adding the new channel following
    the one being copied. 
    Can't duplicate an AudioChannel
    */
    if (this.hasAudioChannel()) {
      alert("You can have only one Audio Channel");
      return;
    }
    let updatedShow = this.state.show;
    let channelToDupe = Object.assign(
      {},
      this.state.show.channels[channelIndex]
    );
    channelToDupe.channelName = channelToDupe.channelName + "2";
    channelToDupe.mqttName = channelToDupe.mqttName + "2";
    let newChannels = this.state.show.channels;
    newChannels.splice(channelIndex + 1, 0, channelToDupe);
    updatedShow.channels = newChannels;
    this.setState({
      show: updatedShow,
    });
    this.handleSave();
    this.checkAndLoadSavedShows();
  };

  setShowName = (newName) => {
    let updatedShow = this.state.show;
    updatedShow.showName = newName;
    this.setState({
      show: updatedShow,
    });
    this.handleSave();
    this.checkAndLoadSavedShows();
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
    // console.log(this.state.show.channels);
    // console.log(this.state.channels);

    return (
      <div className="App">
        <Modal
          show={this.state.showEdit}
          onHide={this.handleCloseEdit}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit an Animation Channel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={4} className="modal-label">
                  Title
                </Col>
                <Col xs={8}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    defaultValue={this.state.editChannelName}
                    onChange={(e) => this.setEditChannelName(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={4} className="modal-label">
                  MQTT Subscriber
                </Col>
                <Col xs={8}>
                  <Form.Control
                    ref={(c) => (this.mqttNameRef = c)}
                    type="text"
                    className="form-control"
                    defaultValue={this.state.editChannelMqttName}
                    onChange={(e) => this.setEditMqttName(e.target.value)}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseEdit}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={this.handleSaveEdit}
              disabled={
                !(this.state.editChannelName && this.state.editChannelMqttName)
              }
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <nav>
          <TitleBar
            showExportVisible={this.state.showExport}
            doExport={this.handleExport}
            doImport={this.handleImport}
            doClearShow={this.handleClearShow}
          />
          <Container
            style={{
              width: "100%",
              marginTop: "35pt",
              marginLeft: "0",
              marginBottom: "0",
              height: "60pt",
            }}
          >
            <Row>
              <Col></Col>
            </Row>
            <Row id="show-stage-wrapper">
              <Col xs={2}>
                <ShowDetails
                  show={this.state.show}
                  handleSetShowName={this.setShowName}
                ></ShowDetails>
              </Col>
              <Col>
                <Stage show={this.state.show} />
              </Col>
            </Row>
          </Container>
        </nav>
        <TimeLineBar
          show={this.state.show}
          saveShowTimes={this.saveShowTimes}
        />
        <div id="contents-wrapper">
          {channels}
          {addNewChannel}
          {emptyShow}
        </div>
      </div>
    );
  }
}

export default App;
