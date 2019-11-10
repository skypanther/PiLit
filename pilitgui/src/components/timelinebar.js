import React, { Component } from 'react';

class TimeLineBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTitle: this.props.title
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
    let emptyTitle = (<span style={{width:'100pt'}}>&nbsp;</span>);
    let ticks = this.makeTickBar();
    return (
      <div id="timelinebar-wrapper">
        <div className="timelinebar-left-col">{ this.props.title || emptyTitle }</div>
        <div className="timelinebar-right-col">{ ticks }</div>
      </div>
    )
  }
}

export default TimeLineBar;