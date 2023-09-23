/*
  showdetails.js -- show name, start, end times
*/
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import TimePicker from "react-time-picker";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const startTimeTitle = "Light Show Start Time";
const stopTimeTitle = "Light Show Stop Time";

class ShowDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalTitle: startTimeTitle,
      showTitle: this.props.show.showName,
      displayTime: null,
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

  setStartTime = (timeValue) => {
    this.setState({
      startTime: timeValue,
    });
    this.props.saveShowTimes({
      startTime: timeValue,
      stopTime: this.state.stopTime.formatted24,
    });
  };

  setStopTime = (timeValue) => {
    this.setState({
      stopTime: timeValue,
    });
    this.props.saveShowTimes({
      startTime: this.state.startTime.formatted24,
      stopTime: timeValue,
    });
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
          <Modal.Body style={{ textAlign: "center" }}></Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.hideModal}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <div id="show-info-wrapper">
          <div>
            <span className="col1">Show Name:</span>
            <span className="col2">
              {this.props.show.showName || emptyTitle}
            </span>
          </div>
          <div className="Timepicker__container">
            <div className="Timepicker__container__content">
              <span className="col1">Start Time:</span>
              <TimePicker
                amPmAriaLabel="Select AM/PM"
                clearAriaLabel="Clear value"
                clockAriaLabel="Toggle clock"
                hourAriaLabel="Hour"
                maxDetail="minute"
                minuteAriaLabel="Minute"
                nativeInputAriaLabel="Time"
                onChange={this.setStartTime}
                secondAriaLabel="Second"
                value={this.props.show.startTime}
              />
            </div>
          </div>

          <div>
            <div className="Timepicker__container">
              <div className="Timepicker__container__content">
                <span className="col1">Stop Time:</span>
                <TimePicker
                  amPmAriaLabel="Select AM/PM"
                  clearAriaLabel="Clear value"
                  clockAriaLabel="Toggle clock"
                  hourAriaLabel="Hour"
                  maxDetail="minute"
                  minuteAriaLabel="Minute"
                  nativeInputAriaLabel="Time"
                  onChange={this.setStopTime}
                  secondAriaLabel="Second"
                  value={this.props.show.stopTime}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ShowDetails;
