/*
  showdetails.js -- show name, start, end times
*/
import React, { Component } from "react";
import TimeKeeper from "react-timekeeper";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

const startTimeTitle = "Light Show Start Time";
const stopTimeTitle = "Light Show Stop Time";

class ShowDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      showEditTitle: false,
      modalTitle: startTimeTitle,
      showTitle: this.props.show.showName,
      startTime: {
        formatted24: "00:00",
        formatted12: "00:00 pm",
        formattedSimple: "00:00",
        hour: 0,
        hour12: 0,
        minute: 0,
        meridiem: "pm",
      },
      stopTime: {
        formatted24: "00:00",
        formatted12: "00:00 pm",
        formattedSimple: "00:00",
        hour: 0,
        hour12: 0,
        minute: 0,
        meridiem: "pm",
      },
    };
  }

  showStartTimeModal = () => {
    this.setState({
      modalTitle: startTimeTitle,
      modalVisible: true,
    });
  };
  showStopTimeModal = () => {
    this.setState({
      modalTitle: stopTimeTitle,
      modalVisible: true,
    });
  };
  hideModal = () => {
    this.setState({ modalVisible: false });
  };
  setTime = (TimeOutput) => {
    if (this.state.modalTitle === startTimeTitle) {
      this.setState({
        startTime: TimeOutput,
      });
      this.props.saveShowTimes({
        startTime: TimeOutput.formatted24,
        stopTime: this.state.stopTime.formatted24,
      });
    } else if (this.state.modalTitle === stopTimeTitle) {
      this.setState({
        stopTime: TimeOutput,
      });
      this.props.saveShowTimes({
        startTime: this.state.startTime.formatted24,
        stopTime: TimeOutput.formatted24,
      });
    }
  };

  showEditTitleModal = () => {
    this.setState({
      showEditTitle: true,
    });
  };
  hideEditTitleModal = () => {
    this.setState({ showEditTitle: false });
  };

  render() {
    let emptyTitle = "Empty Show";
    return (
      <>
        <Modal
          show={this.state.modalVisible}
          onHide={this.hideModal}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: "center" }}>
            <TimeKeeper onChange={this.setTime} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.hideModal}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={this.state.showEditTitle}
          onHide={this.state.hideEditTitleModal}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Show Title</Modal.Title>
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
                    defaultValue={this.props.show.showName || emptyTitle}
                    onChange={(e) =>
                      this.props.handleSetShowName(e.target.value)
                    }
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.hideEditTitleModal}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <div id="show-info-wrapper">
          <div>
            <span className="col1">Show Name:</span>
            <span
              className="col2"
              onClick={(e) => {
                this.showEditTitleModal();
              }}
            >
              {this.props.show.showName || emptyTitle}
            </span>
          </div>
          <div>
            <span className="col1">Start Time:</span>
            <span className="col2" onClick={this.showStartTimeModal}>
              {this.props.show.startTime}
            </span>
          </div>
          <div>
            <span className="col1">Stop Time:</span>
            <span className="col2" onClick={this.showStopTimeModal}>
              {this.props.show.stopTime}
            </span>
          </div>
        </div>
      </>
    );
  }
}

export default ShowDetails;
