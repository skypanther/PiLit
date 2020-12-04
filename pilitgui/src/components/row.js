/*
  Creates a row (aka an animation channel)
*/
import React, { Component } from 'react';
import PixelNode from './nodes/pixelnode';
import PixelTree from './nodes/pixeltree';
import OnOffNode from './nodes/onoffnode';
import MultiRelayNode from './nodes/multirelaynode';

// FontAwesome
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from 'react-bootstrap/Button'

import leaping_arch from '../../public/images/leaping_arch.jpg';
import mega_tree from '../../public/images/mega_tree.jpg';
import pixel_tree from '../../public/images/pixel_tree.gif';
import spotlight from '../../public/images/spotlight.jpg';


const nodeTypes = {
  PixelNode: leaping_arch,
  OnOffNode: spotlight,
  MultiRelayNode: mega_tree,
  PixelTree: pixel_tree,
}


class Row extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      nodes: [],
      totalDuration: "00:00"
    }
    if (this.props.animationsFromImport && this.props.animationsFromImport.length > 0) {
      this.createAnimationsFromImport()
    }
  }

  createAnimationsFromImport = () => {
    // called as part of the import flow, this function creates the animation nodes
    // from the imported data
    let animationsToImport = this.props.animationsFromImport.map((anim) => {
      var newNode;
      switch (this.props.type) {
        case 'PixelNode':
          newNode = (
            <PixelNode key={"node"+anim.nodeIndex}
              mqttName={this.props.channelName}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim} />
          );
        break;
        case 'PixelTree':
          newNode = (
            <PixelTree key={"node"+anim.nodeIndex}
              mqttName={this.props.channelName}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim} />
          );
        break;
        case 'OnOffNode':
          newNode = (
            <OnOffNode key={"node"+anim.nodeIndex}
              mqttName={this.props.channelName}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim} />
          );
        break;
        case 'MultiRelayNode':
          newNode = (
            <MultiRelayNode key={"node"+anim.nodeIndex}
              mqttName={this.props.channelName}
              type={this.props.type}
              saveNodeConfig={this.saveNodeConfig}
              removeNode={this.removeNode}
              index={anim.nodeIndex}
              initialProperties={anim} />
          );
        break;
      }
      return newNode;
    });
    this.state.nodes = animationsToImport;
    this.state.nextIndex = animationsToImport.length + 1;
  }

  handleAddNode = () => {
    // Called when adding a new animation node via the UI.
    let index = this.state.nextIndex;
    var newNode;
    switch (this.props.type) {
      case 'PixelNode':
        newNode = (
          <PixelNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
      break;
      case 'PixelTree':
        newNode = (
          <PixelTree
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
      break;
      case 'OnOffNode':
        newNode = (
          <OnOffNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
      break;
      case 'MultiRelayNode':
        newNode = (
          <MultiRelayNode
            key={"node" + index}
            mqttName={this.props.mqttName}
            channelName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index}
          />
        );
      break;
    }
    this.setState({
      nodes: [...this.state.nodes, newNode],
      nextIndex: index + 1
    });
  }

  removeNode = (index, nodeToRemove) => {
    // Called when removing an animation node via the UI. Passed to the the child node components.
    // index - the nodes index within the array of nodes
    // nodeToRemove - a reference to the node being removed so that we can remove it from state
    var currentNodes = this.state.nodes;
    let removedNodes = currentNodes.splice(index, 1);
    if (removedNodes.length === 1) {
      this.props.handleRemoveAnimation(nodeToRemove)
      this.setState({ nodes: currentNodes});
    }
  }

  saveNodeConfig = (nodeToAddOrUpdate) => {
    // Called when adding or updating an animation node via the UI. Passed to the the child node components.
    // nodeToAddOrUpdate - a reference to the node being added/updated so that we can update it in state
    this.props.handleAddAnimation(nodeToAddOrUpdate);
    this.updateTotalDuration(nodeToAddOrUpdate.duration);
  }

  updateTotalDuration = (duration) => {
    let currentTotalDuration = this.hmsToSeconds(this.state.totalDuration)
    console.log(currentTotalDuration, this.secondsToHms(currentTotalDuration + duration))
    this.setState({
      totalDuration: this.secondsToHms(currentTotalDuration + duration)
    })
  }

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
  }

  secondsToHms = (sec) => {
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    var hDisplay = h > 0 ? (h + ":") : "";
    var mDisplay = m > 0 ? m : "00";
    var sDisplay = s > 0 ? s : "00";
    return hDisplay + mDisplay + ":" + sDisplay; 
  }


  render() {
    return (
      <div className="row-outer-wrapper">
        <div className="row-wrapper">
          <div className="row-title"><div className="row-title-text">{this.props.channelName}</div></div>
          <div className="row-image-wrapper" id="rowImage">
            <img src={nodeTypes[this.props.type]} className="row-image" />
            <span className="duration">{this.state.totalDuration}</span>
          </div>
          <div id="rowWrapper" className="row-inner-wrapper">
            { this.state.nodes }
          </div>
          <div className="row-button-wrapper">
            <Button variant="light"><FontAwesomeIcon icon={faPlusCircle} onClick={() => { this.handleAddNode() }} /></Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Row;