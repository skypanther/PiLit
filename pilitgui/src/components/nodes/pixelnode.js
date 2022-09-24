import React, { Component } from "react";
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

import {
  animations,
  animationStyles,
  colors,
  colorStyles,
} from "/src/constants";

class PixelNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      nodeText: "",
      animation: "",
      animationIndex: null,
      color: "",
      colorIndex: null,
      duration: 10,
      loopDelay: 10,
      holdTime: 50,
      repeatable: true,
      mqttName: this.props.mqttName,
      type: this.props.type,
      nodeIndex: this.props.index,
      channelIndex: this.props.channelIndex,
    };
    if (this.props.initialProperties) {
      let animationIndex = animations.findIndex(
        (item) => item.value === this.props.initialProperties.animation
      );
      let nodeText =
        this.props.initialProperties.animation +
        "\n" +
        this.props.initialProperties.color +
        "\nD: " +
        this.props.initialProperties.duration +
        "\nLD: " +
        this.props.initialProperties.loopDelay +
        ", HT: " +
        this.props.initialProperties.holdTime;
      this.state = {
        show: false,
        nodeText: nodeText,
        animation: this.props.initialProperties.animation,
        animationIndex: animationIndex,
        color: this.props.initialProperties.color,
        colorIndex: this.props.initialProperties.colorIndex,
        duration: this.props.initialProperties.duration,
        loopDelay: this.props.initialProperties.loopDelay,
        holdTime: this.props.initialProperties.holdTime,
        repeatable: this.props.initialProperties.repeatable,
        mqttName: this.props.mqttName,
        type: this.props.type,
        nodeIndex: this.props.index,
        channelIndex: this.props.channelIndex,
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
      "\n" +
      this.state.color +
      "\nD: " +
      this.state.duration +
      "\nLD: " +
      this.state.loopDelay +
      ", HT:" +
      this.state.holdTime;
    this.setState({
      show: false,
      nodeText: nodeText,
    });
    this.props.saveNodeConfig(this.state);
  };
  handleDelete = () => {
    this.props.removeNode(this.state, this.props.channelIndex);
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
  isRepeatable(isChecked) {
    this.setState({ repeatable: isChecked });
  }
  setColor(colorObj) {
    let colorIndex = colors.findIndex((item) => item.value === colorObj.value);
    this.setState({
      color: colorObj.value,
      colorIndex: colorIndex,
    });
  }
  setDuration(newValue) {
    if (newValue) {
      this.setState({ duration: parseInt(newValue) });
    }
  }
  setLoopDelay(newValue) {
    if (newValue) {
      this.setState({ loopDelay: parseInt(newValue) });
    }
  }
  setHoldTime(newValue) {
    if (newValue) {
      this.setState({ holdTime: parseInt(newValue) });
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
                <Col xs={4}>
                  <Form.Check
                    type="checkbox"
                    label="Repeat?"
                    className="node-checkbox"
                    style={{ marginLeft: "10px", marginTop: "10pt" }}
                    inline="true"
                    checked={this.state.repeatable}
                    onChange={(e) => this.isRepeatable(e.target.checked)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={8}>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Color"
                    options={colors}
                    styles={colorStyles}
                    value={
                      this.state.colorIndex !== null
                        ? colors[this.state.colorIndex]
                        : null
                    }
                    onChange={(e) => this.setColor(e)}
                  />
                </Col>
                <Col xs={4}></Col>
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
                  (milliseconds)
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Hold Time
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    value={this.state.holdTime}
                    onChange={(e) => this.setHoldTime(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (milliseconds)
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
              disabled={!(this.state.animation && this.state.color)}
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

export default PixelNode;
