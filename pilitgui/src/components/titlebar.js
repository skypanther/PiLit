import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'

class TitleBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var saveAndExportButtons = null;
    if (this.props.showExportVisible) {
        saveAndExportButtons = (
            <>
            <Button variant="primary" size="sm" onClick={this.props.doExport}>Save</Button>
            <Button variant="success" size="sm" onClick={this.props.doExport}>Export</Button>
            </>
        )
    }
    return (
      <div id="app-title-bar">
        <div id="app-name"><strong>PiLit GUI</strong> &mdash; Show maker for the PiLit holiday lights framework</div>
        <div id="export-button-wrapper">{ saveAndExportButtons }</div>
      </div>
    )
  }
}

export default TitleBar;