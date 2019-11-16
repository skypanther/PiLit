/*
  Creates a row (aka an animation channel)
*/
import React, { Component } from 'react';
import PixelNode from './nodes/pixelnode';
import OnOffNode from './nodes/onoffnode';

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
  MegaTree: mega_tree,
  PixelTree: pixel_tree,
}


class Row extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextIndex: 0,
      nodes: []
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
          <PixelNode key={"node"+index}
            mqttName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index} />
        );
      break;
      case 'OnOffNode':
        newNode = (
          <OnOffNode key={"node"+index}
            mqttName={this.props.channelName}
            type={this.props.type}
            saveNodeConfig={this.saveNodeConfig}
            removeNode={this.removeNode}
            index={index} />
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
  }

  render() {
    return (
      <div className="row-outer-wrapper">
        <div className="row-wrapper">
          <div className="row-title"><div className="row-title-text">{this.props.channelName}</div></div>
          <div className="row-image-wrapper" id="rowImage"><img src={nodeTypes[this.props.type]} className="row-image" /></div>
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