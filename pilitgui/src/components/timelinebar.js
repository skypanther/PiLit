import React, { Component } from 'react';

class TimeLineBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTitle: this.props.title
    }
  }

  render() {
    let emptyTitle = (<span style={{width:'100pt'}}>&nbsp;</span>)
    return (
      <div id="timelinebar-wrapper">
        <div className="timelinebar-left-col">{ this.props.title || emptyTitle }</div>
        <div className="timelinebar-right-col">right</div>
      </div>
    )
  }
}

export default TimeLineBar;