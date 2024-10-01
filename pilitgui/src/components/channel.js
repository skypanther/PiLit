/*
  Creates a channel (aka a row in the timeline)
*/
import React, { Component } from "react";
import PixelNode from "./nodes/pixelnode";
import PixelTree from "./nodes/pixeltree";
import OnOffNode from "./nodes/onoffnode";
import MultiRelayNode from "./nodes/multirelaynode";
import SpheroNode from "./nodes/sphero";
import MovinMax from "./nodes/movinmax";
import AudioNode from "./nodes/audioNode";
import ShellyNode from "./nodes/shelly";

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "react-bootstrap/Button";

import leaping_arch from "url:~/public/images/leaping_arch.jpg";
import mega_tree from "url:~/public/images/mega_tree.jpg";
import pixel_tree from "url:~/public/images/pixel_tree.gif";
import spotlight from "url:~/public/images/spotlight.png";
import sphero_img from "url:~/public/images/sphero_img.jpg";
import music_note from "url:~/public/images/music_note3.png";
import movin_max from "url:~/public/images/movin_max.png";
import light_switch from "url:~/public/images/light_switch.jpg";
import MenuContext from "./subcomponents/menucontext";

import { channelContextMenuItems } from "../ChannelContextMenuItems";

const nodeTypes = {
  AudioNode: music_note,
  PixelNode: leaping_arch,
  OnOffNode: spotlight,
  MultiRelayNode: mega_tree,
  PixelTree: pixel_tree,
  SpheroNode: sphero_img,
  MovinMax: movin_max,
  ShellyNode: light_switch,
};

class Channel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      totalDuration: "00:00",
      animNodes: [],
    };
    if (
      this.props.animationsFromImport &&
      this.props.animationsFromImport.length > 0
    ) {
      this.createAnimationsFromImport();
    }
  }

  createAnimationsFromImport = () => {
    // called as part of the import flow, this function creates the animation nodes
    // from the imported data
    var totalDuration = 0;
    let animationsToImport = this.props.animationsFromImport.map((anim) => {
      totalDuration += parseInt(anim.duration);
      var newNode;
      switch (this.props.type) {
        case "PixelNode":
          newNode = (
            <PixelNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "PixelTree":
          newNode = (
            <PixelTree
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "OnOffNode":
          newNode = (
            <OnOffNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "MultiRelayNode":
          newNode = (
            <MultiRelayNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "SpheroNode":
          newNode = (
            <SpheroNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "MovinMax":
          newNode = (
            <MovinMax
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "AudioNode":
          newNode = (
            <AudioNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
        case "ShellyNode":
          newNode = (
            <ShellyNode
              key={"node" + anim.nodeIndex}
              mqttName={this.props.channelName}
              channelIndex={this.props.channelIndex}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim}
            />
          );
          break;
      }
      this.state.animNodes.push({
        nodeIndex: anim.nodeIndex,
        duration: anim.duration,
        channelIndex: this.props.channelIndex,
      });
      return newNode;
    });
    this.state.nodes = animationsToImport;
    this.state.totalDuration = this.secondsToHms(totalDuration);
  };

  handleAddNode = () => {
    // Called when adding a new animation node via the UI.
    let index = this.state.animNodes.length;
    var newNode;
    switch (this.props.type) {
      case "PixelNode":
        newNode = (
          <PixelNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "PixelTree":
        newNode = (
          <PixelTree
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "OnOffNode":
        newNode = (
          <OnOffNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "MultiRelayNode":
        newNode = (
          <MultiRelayNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "SpheroNode":
        newNode = (
          <SpheroNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "MovinMax":
        newNode = (
          <MovinMax
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "AudioNode":
        newNode = (
          <AudioNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
        break;
      case "ShellyNode":
        newNode = (
          <ShellyNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelIndex={this.props.channelIndex}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
    }
    this.setState({
      nodes: [...this.state.nodes, newNode],
      animNodes: [
        ...this.state.animNodes,
        {
          nodeIndex: index,
          duration: 10,
          channelIndex: this.props.channelIndex,
        },
      ],
    });
  };

  removeNode = (nodeToRemove, channelIndex) => {
    // Called when removing an animation node via the UI. Passed to the the child node components.
    // index - the nodes index within the array of nodes
    // nodeToRemove - a reference to the node being removed so that we can remove it from state
    var currentNodes = this.state.nodes;
    let removedNodes = currentNodes.splice(nodeToRemove.nodeIndex, 1);
    if (removedNodes.length === 1) {
      this.props.handleRemoveAnimation(nodeToRemove, channelIndex);
      this.setState({ nodes: currentNodes });
    }
    let currentAnimNodes = this.state.animNodes;
    let removedAnimNodes = currentAnimNodes.splice(nodeToRemove.nodeIndex, 1);
    if (removedAnimNodes.length === 1) {
      this.setState({ animNodes: currentAnimNodes });
      this.calcTotalDuration();
    }
  };

  saveNodeConfig = (nodeToAddOrUpdate) => {
    // Called when adding or updating an animation node via the UI. Passed to the the child node components.
    // nodeToAddOrUpdate - a reference to the node being added/updated so that we can update it in state
    this.props.handleAddAnimation(nodeToAddOrUpdate);
    let anIndex = this.state.animNodes.findIndex(
      (an) => an.nodeIndex == nodeToAddOrUpdate.nodeIndex
    );
    if (anIndex > -1) {
      let newAnimNodes = this.state.animNodes;
      newAnimNodes[anIndex].duration = nodeToAddOrUpdate.duration;
      this.setState({ animNodes: newAnimNodes });
    }
    this.calcTotalDuration();
    // this.updateTotalDuration(nodeToAddOrUpdate.duration);
  };

  calcTotalDuration = () => {
    // TODO: need to loop through all the animations
    let totalDuration = 0;
    this.state.animNodes.forEach((node) => {
      totalDuration += node.duration;
    });
    this.setState({
      totalDuration: this.secondsToHms(totalDuration),
    });
  };

  updateTotalDuration = (duration) => {
    let currentTotalDuration = this.hmsToSeconds(this.state.totalDuration);
    this.setState({
      totalDuration: this.secondsToHms(currentTotalDuration + duration),
    });
  };

  hmsToSeconds = (hms) => {
    let hmsParts = hms.split(":");
    let seconds = 0;
    if (hmsParts.length === 3) {
      seconds += parseInt(hmsParts[0], 10) * 60 * 60;
      seconds += parseInt(hmsParts[1], 10) * 60;
      seconds += parseInt(hmsParts[2], 10);
    } else {
      seconds += parseInt(hmsParts[0], 10) * 60;
      seconds += parseInt(hmsParts[1], 10);
    }
    return seconds;
  };

  secondsToHms = (sec) => {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = Math.floor((sec % 3600) % 60);

    var hDisplay = h > 0 ? h + ":" : "";
    var mDisplay = m > 0 ? m : "00";
    var sDisplay = s > 0 ? s : "00";
    return hDisplay + mDisplay + ":" + sDisplay;
  };

  render() {
    let class_name = `channel-outer-wrapper ${this.props.type}`;
    return (
      <div className={class_name}>
        <div className="channel-wrapper">
          <MenuContext
            channelName={this.props.channelName}
            channelIndex={this.props.channelIndex}
            handleDeleteChannel={this.props.handleDeleteChannel}
            handleDuplicateChannel={this.props.handleDuplicateChannel}
            handleChannelEdit={this.props.handleChannelEdit}
            mqttName={this.props.mqttName}
          />
          <div className="channel-image-wrapper" id="rowImage">
            <img src={nodeTypes[this.props.type]} className="channel-image" />
            <span className="duration">{this.state.totalDuration}</span>
            <div className="removeChannel">
              {/* now available in context menu, so removed here
              <Button variant="outline-danger" size="sm">
                <FontAwesomeIcon
                  icon={faMinusCircle}
                  onClick={() => {
                    this.props.handleDeleteChannel(this.props.channelIndex);
                  }}
                />
              </Button> */}
            </div>
          </div>
          <div id="rowWrapper" className="channel-inner-wrapper">
            {this.state.nodes}
          </div>
          <div className="channel-button-wrapper">
            <Button
              variant="light"
              onClick={() => {
                this.handleAddNode();
              }}
            >
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Channel;
