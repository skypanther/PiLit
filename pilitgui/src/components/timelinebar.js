/*
  timelinebar.js -- creates the timeline and show details bar
*/
import React, { Component } from "react";

class TimeLineBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <div id="show-timeline-wrapper">
          <div className="timelinebar">
            <div className="timelinebar-left-col"></div>
            <div className="timelinebar-right-col"></div>
          </div>
        </div>
      </>
    );
  }
}

export default TimeLineBar;
