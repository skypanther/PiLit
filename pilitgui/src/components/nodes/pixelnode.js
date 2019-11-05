import React, { Component } from 'react';

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class PixelNode extends Component {

  handleAddNode = () => {

  }

  render() {
    return (
      <div className="node-wrapper">
        <div className="node-inner-wrapper">
          Pixel Node
        </div>
      </div>
    )
  }
}

export default PixelNode;