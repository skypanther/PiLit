/*
  showdetails.js -- show name, start, end times
*/
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import TimeKeeper from "react-timekeeper";

const startTimeTitle = "Light Show Start Time";
const stopTimeTitle = "Light Show Stop Time";

class ShowDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalTitle: startTimeTitle,
      showTitle: this.props.showName,
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

        <div id="show-info-wrapper">
          <div>
            <span className="col1">Show Name:</span>
            <span className="col2">{this.props.showName || emptyTitle}</span>
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
