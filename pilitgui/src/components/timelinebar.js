import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'
import TimeKeeper from 'react-timekeeper';


const startTimeTitle = "Light Show Start Time";
const stopTimeTitle = "Light Show Stop Time";

class TimeLineBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalTitle: startTimeTitle,
      showTitle: this.props.title,
      startTime: {
          formatted24: '00:00',
          formatted12: '00:00 pm',
          formattedSimple: '00:00',
          hour: 0,
          hour12: 0,
          minute: 0,
          meridiem: 'pm'        
      },
      stopTime: {
          formatted24: '00:00',
          formatted12: '00:00 pm',
          formattedSimple: '00:00',
          hour: 0,
          hour12: 0,
          minute: 0,
          meridiem: 'pm'        
      }
    }
  }

  showStartTimeModal = () => {
    this.setState({
      modalTitle: startTimeTitle,
      modalVisible:true
    });
  }
  showStopTimeModal = () => {
    this.setState({
      modalTitle: stopTimeTitle,
      modalVisible:true
    });
  }
  hideModal = () => {
    this.setState({modalVisible:false});
  }
  setTime = (TimeOutput) => {
    if (this.state.modalTitle === startTimeTitle) {
      this.setState({
        startTime: TimeOutput
      });
      this.props.saveShowTimes({
        startTime: TimeOutput.formatted24,
        stopTime: this.state.stopTime.formatted24
      })
    } else if (this.state.modalTitle === stopTimeTitle) {
      this.setState({
        stopTime: TimeOutput
      });
      this.props.saveShowTimes({
        startTime: this.state.startTime.formatted24,
        stopTime: TimeOutput.formatted24
      })
    }

  }

  makeTickBar = () => {
    let docWidth = 10000;
    // console.log(docWidth)
    let numTicks = Math.floor(docWidth / 20);
    let ticks = [];
    for (var i=0; i<numTicks; i++) {
      ticks.push( (<span key={ "tick" + i } className="tick-mark">&nbsp;</span>) );
    }
    return ticks;
  }

  render() {
    let emptyTitle = (<span style={{width:'100pt'}}>Show Title</span>);
    let ticks = this.makeTickBar();
    return (
      <>
        <Modal show={this.state.modalVisible} onHide={this.hideModal} animation={true}>
          <Modal.Header closeButton>
            <Modal.Title>{ this.state.modalTitle }</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: 'center' }}>
            <TimeKeeper onChange={ this.setTime } />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.hideModal}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <div id="timelinebar-wrapper">
          <div className="show-info-wrapper">
            <div>
              <span className="col1">Show Name:</span>
              <span className="col2">{ this.props.title || emptyTitle }</span>
            </div>
            <div>
              <span className="col1">Start Time:</span>
              <span className="col2" onClick={this.showStartTimeModal}>{ this.state.startTime.formatted24 }</span>
            </div>
            <div>
              <span className="col1">Stop Time:</span>
              <span className="col2" onClick={this.showStopTimeModal}>{ this.state.stopTime.formatted24 }</span>
            </div>
          </div>
          <div>
            <div className="timelinebar-left-col"></div>
            <div className="timelinebar-right-col">{ ticks }</div>
          </div>
        </div>
      </>
    )
  }
}

export default TimeLineBar;