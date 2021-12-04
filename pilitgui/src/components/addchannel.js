import React, { Component } from "react";
import Select from "react-select";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import BootstrapSwitchButton from "bootstrap-switch-button-react";

// FontAwesome
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const nodeTypes = [
  { label: "RGB Pixel Node", value: "PixelNode" },
  { label: "RGB Pixel Tree", value: "PixelTree" },
  { label: "On / Off (spotlight) Node", value: "OnOffNode" },
  { label: "Mega Tree (multi-relay)", value: "MultiRelayNode" },
  { label: "Sphero Pixel Node", value: "SpheroNode" },
];

class AddChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      showName: "",
      channelType: "",
      channelName: "",
      mqttName: "",
      nodes: [],
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAddRow = this.handleAddRow.bind(this);
    this.setShowName = this.setShowName.bind(this);
    this.setChannelType = this.setChannelType.bind(this);
    this.setChannelName = this.setChannelName.bind(this);
    this.setMqttName = this.setMqttName.bind(this);
  }

  handleShow = () => {
    this.setState({ show: true });
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  handleSave = () => {
    this.setState({ show: false });
    this.props.handleAddNewRow({
      showName: this.state.showName,
      channelType: this.state.channelType,
      channelName: this.state.channelName,
      mqttName: this.state.mqttName,
    });
  };

  handleAddRow = () => {
    this.setState({ show: true });
  };

  setShowName = (val) => {
    this.setState({
      showName: val,
    });
  };
  setChannelType = (val) => {
    this.setState({
      channelType: val,
    });
  };
  setChannelName = (val) => {
    this.setState({
      channelName: val,
    });
  };
  setMqttName = (val) => {
    this.setState({
      mqttName: val,
    });
  };

  render() {
    return (
      <>
        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add An Animation Channel / Group</Modal.Title>
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
                    defaultValue=""
                    onChange={(e) => this.setChannelName(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={4} className="modal-label">
                  Channel Type
                </Col>
                <Col xs={8}>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Channel Type"
                    options={nodeTypes}
                    onChange={(e) => this.setChannelType(e.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={4} className="modal-label">
                  MQTT Subscriber
                </Col>
                <Col xs={8}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    defaultValue=""
                    onChange={(e) => this.setMqttName(e.target.value)}
                  />
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
              disabled={!(this.state.channelName && this.state.channelType)}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="addchannel-wrapper">
          <div className="addchannel-title">
            <p>Add Another Channel</p>
          </div>
          <div className="addchannel-button-wrapper">
            <Button variant="light" size="lg">
              <FontAwesomeIcon
                icon={faPlusCircle}
                onClick={() => {
                  this.handleAddRow();
                }}
              />
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default AddChannel;
