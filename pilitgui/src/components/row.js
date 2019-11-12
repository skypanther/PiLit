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
  }

  handleAddNode = () => {
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

  removeNode = (index) => {
    var currentNodes = [...this.state.nodes];
    currentNodes.splice(index, 1);
    this.setState({ nodes: currentNodes});
  }

  saveNodeConfig = (index, newConfig) => {
    console.log("saving animation " + index);
    this.props.handleAddAnimation(newConfig);
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