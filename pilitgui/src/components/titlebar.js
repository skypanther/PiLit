import React, { Component } from 'react';
import FormControl from 'react-bootstrap/FormControl'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'



class TitleBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      importFileContents: "",
    }
  }

  handleShow = () => {
    this.setState({
      show: true,
      importFileContents: ""
    });
  }
  handleClose = () => {
    this.setState({show:false});
  }

  savePastedJSON = (e) => {
    this.setState({
      importFileContents: e.target.value
    })
  }
  importFile = () => {
    this.props.doImport(this.state.importFileContents);
    this.setState({
      show: false,
      importFileContents: "",
    });
}

  render() {
    var exportButton = null;
    if (this.props.showExportVisible) {
        exportButton = (
            <Button variant="primary" size="sm" onClick={this.props.doExport}>Export</Button>
        )
    }
    return (
      <>
        <Modal show={this.state.show} onHide={this.handleClose} size="lg" animation={true}>
          <Modal.Header closeButton>
            <Modal.Title>Import Show File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col>Paste the contents of a PiLit show file (.json) here to import it.</Col>
              </Row>
              <Row>
                <Col>
                  <Form.Control as="textarea" rows="12" onChange={this.savePastedJSON} />
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.importFile}>
              Import
            </Button>
          </Modal.Footer>
        </Modal>
        <div id="app-title-bar">
          <div id="app-name"><strong>PiLit GUI</strong> &mdash; Show maker for the PiLit holiday lights framework</div>
          <div id="export-button-wrapper">
              <Button variant="success" size="sm" onClick={this.handleShow}>Import</Button>
            { exportButton }
          </div>
        </div>
      </>
    )
  }
}

export default TitleBar;