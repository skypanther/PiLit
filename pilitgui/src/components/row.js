import React, { Component } from 'react';
import PixelNode from './nodes/pixelnode';

// FontAwesome
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from 'react-bootstrap/Button';

import leaping_arch from '../../public/images/leaping_arch.jpg';

class Row extends Component {
  constructor(props) {
    super(props);
  }

  handleAddNode = () => {

  }

  render() {
    var rowTitle = "Arch 1";
    return (
      <div className="row-outer-wrapper">
        <div className="row-wrapper">
          <div className="row-title"><div className="row-title-text">{rowTitle}</div></div>
          <div className="row-image-wrapper" id="rowImage"><img src={leaping_arch} className="row-image" /></div>
          <div id="rowWrapper" className="row-inner-wrapper">
            <PixelNode />
            <PixelNode />
          </div>
          <div className="button-wrapper">
            <Button variant="light"><FontAwesomeIcon icon={faPlusCircle} onClick={() => { this.handleAddNode() }} /></Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Row;