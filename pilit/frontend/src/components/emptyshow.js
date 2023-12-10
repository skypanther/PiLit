import React, { Component } from "react";
import Select from "react-select";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// FontAwesome
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { nodeTypes } from "../constants";

class EmptyShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      showName: "",
      channelType: "",
      channelName: "",
      nodes: [],
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAddChannel = this.handleAddChannel.bind(this);
    this.setShowName = this.setShowName.bind(this);
    this.setChannelType = this.setChannelType.bind(this);
    this.setChannelName = this.setChannelName.bind(this);
  }

  handleShow = () => {
    this.setState({ show: true });
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  handleSave = () => {
    this.setState({ show: false });
    this.props.handleAddNewChannel({
      showName: this.state.showName,
      channelType: this.state.channelType,
      channelName: this.state.channelName,
    });
  };

  handleAddChannel = () => {
    this.setState({ show: true });
  };

  setShowName = (val) => {
    this.setState({ showName: val });
  };
  setChannelType = (val) => {
    this.setState({ channelType: val });
  };
  setChannelName = (val) => {
    this.setState({ channelName: val });
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
            <Modal.Title>Create a PiLit Animation Show</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={4} className="modal-label">
                  Show Name
                </Col>
                <Col xs={8}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    defaultValue=""
                    onChange={(e) => this.setShowName(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={4} className="modal-label">
                  First Channel Type
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
                    onChange={(e) => this.setChannelName(e.target.value)}
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
              disabled={
                !(
                  this.state.showName &&
                  this.state.channelName &&
                  this.state.channelType
                )
              }
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="emptyshow-wrapper">
          <div className="emptyshow-title">
            <p>
              Let&apos;s get this show on the road!
              <br />
              Start a new show by clicking the +
            </p>
          </div>
          <div className="emptyshow-button-wrapper">
            <Button variant="light" size="lg">
              <FontAwesomeIcon
                icon={faPlusCircle}
                onClick={() => {
                  this.handleAddChannel();
                }}
              />
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default EmptyShow;
