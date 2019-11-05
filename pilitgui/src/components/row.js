import React, { Component } from 'react';
import PixelNode from './nodes/pixelnode';

// FontAwesome
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from 'react-bootstrap/Button';

class Row extends Component {
  constructor(props) {
    super(props);
  }

  handleAddNode = () => {

  }

  render() {
    var rowTitle = "Pixel Tree 3";
    return (
      <div className="row-wrapper">
        <div className="row-title">{rowTitle}</div>
        <div className="row-inner-wrapper">
          <PixelNode />
        </div>
        <Button variant="outline-light" className="add-node-button"><FontAwesomeIcon icon={faPlusCircle} onClick={() => { this.handleAddNode() }} /></Button>
      </div>
    )
  }
}

export default Row;