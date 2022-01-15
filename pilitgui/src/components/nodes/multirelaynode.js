import React, { Component } from "react";
import chroma from "chroma-js";
import Select from "react-select";

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const animationStyles = {
  control: (styles) => ({ ...styles, fontSize: "8pt" }),
  option: (styles) => ({ ...styles, fontSize: "8pt", padding: "4pt" }),
};

const animations = [
  {
    label: "All on",
    value: "on",
    description: "All relays on",
  },
  {
    label: "All off",
    value: "off",
    description: "All relays off",
  },
  {
    label: "March - single",
    value: "march_single",
    description: "March a single 'on' relay around the set",
  },
  {
    label: "March - single (inverted)",
    value: "march_single_inverted",
    description: "March a single 'off' relay around the set",
  },
  {
    label: "March - two opposite",
    value: "march_two_opposite",
    description: "March two 'on' relays on opposite sides around the set",
  },
  {
    label: "March - two opposite (inverted)",
    value: "march_two_opposite_inverted",
    description: "March two 'off' relays on opposite sides around the set",
  },
  {
    label: "March - four",
    value: "march_four",
    description: "March four 'on' relays around the set",
  },
  {
    label: "March - four (inverted)",
    value: "march_four_inverted",
    description: "March four 'off' relays around the set",
  },
  {
    label: "Every other relay on",
    value: "alternate",
    description: "Alternate on/off relays",
  },
];

class MultiRelayNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      nodeText: "",
      animation: "",
      animationIndex: null,
      duration: 10,
      loopDelay: 200,
      mqttName: this.props.mqttName,
      type: this.props.type,
      nodeIndex: this.props.index,
    };
    if (this.props.initialProperties) {
      let animationIndex = animations.findIndex(
        (item) => item.value === this.props.initialProperties.animation
      );
      let nodeText =
        this.props.initialProperties.animation +
        "\nD: " +
        this.props.initialProperties.duration +
        "\nLD: " +
        this.props.initialProperties.loopDelay;
      this.state = {
        show: false,
        nodeText: nodeText,
        animation: this.props.initialProperties.animation,
        animationIndex: animationIndex,
        duration: this.props.initialProperties.duration,
        loopDelay: this.props.initialProperties.loopDelay,
        mqttName: this.props.mqttName,
        type: this.props.type,
        nodeIndex: this.props.initialProperties.nodeIndex,
      };
    }
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleShow = () => {
    this.setState({ show: true });
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  handleSave = () => {
    let nodeText =
      this.state.animation +
      "\nD: " +
      this.state.duration +
      "\nLD: " +
      this.state.loopDelay;
    this.setState({
      show: false,
      nodeText: nodeText,
    });
    this.props.saveNodeConfig(this.state);
  };
  handleDelete = () => {
    this.props.removeNode(this.props.index, this.state);
  };

  setAnimationType(animObj) {
    let animationIndex = animations.findIndex(
      (item) => item.value === animObj.value
    );
    this.setState({
      animation: animObj.value,
      animationIndex: animationIndex,
    });
  }
  setDuration(newValue) {
    if (newValue) {
      this.setState({ duration: parseInt(newValue) });
    }
  }
  setLoopDelay(newValue) {
    if (newValue) {
      if (newValue < 200) {
        newValue = 200;
      }
      this.setState({ loopDelay: parseInt(newValue) });
    }
  }

  render() {
    let nodeWidth = Math.max(this.state.duration * 10, 100);
    return (
      <>
        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Pixel Animation Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={8}>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Animation"
                    options={animations}
                    styles={animationStyles}
                    value={
                      this.state.animationIndex !== null
                        ? animations[this.state.animationIndex]
                        : null
                    }
                    onChange={(e) => this.setAnimationType(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Duration
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    value={this.state.duration}
                    onChange={(e) => this.setDuration(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (seconds)
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Loop Delay
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    value={this.state.loopDelay}
                    onChange={(e) => this.setLoopDelay(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (milliseconds, 200 minimum)
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={this.handleSave}
              disabled={!this.state.animation}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="node-wrapper" style={{ width: nodeWidth + "px" }}>
          <div className="removeNode">
            <Button variant="outline-danger" size="sm">
              <FontAwesomeIcon
                icon={faMinusCircle}
                onClick={() => {
                  this.handleDelete();
                }}
              />
            </Button>
          </div>
          <div className="node-inner-wrapper" onClick={this.handleShow}>
            <p>{this.state.nodeText}</p>
          </div>
        </div>
      </>
    );
  }
}

export default MultiRelayNode;
