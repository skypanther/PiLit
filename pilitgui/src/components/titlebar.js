import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'

class TitleBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var btn = null;
    if (this.props.showExportVisible) {
        btn = (
            <Button variant="success" size="sm" onClick={this.props.doExport}>Export</Button>
        )
    }
    return (
      <div id="app-title-bar">
        <div id="app-name"><strong>PiLit GUI</strong> &mdash; Show maker for the PiLit holiday lights framework</div>
        <div id="export-button-wrapper">{ btn }</div>
      </div>
    )
  }
}

export default TitleBar;