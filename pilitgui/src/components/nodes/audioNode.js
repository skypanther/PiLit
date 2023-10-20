/*

Dev notes: 

Short term, I could:
  - put the files on both player node and whatever runs this front-end
  - add build script that runs before "parcel" in the start script
    - it should read the contents of the public/audio_clips directory
    - generate a file containing that list of names, one per line
    - write that file to public/audio_files.txt
  - this component would import the list of files
    - read the names
    - populate the state.animations array
    - which would then be used to provide a select list of the clip files, which WaveSurfer could then parse
  - it should have a sticky param for the abs file path on the player (server) node
  - for now, it can simply play from time 0 to the end of the clip; so, hard-code those values to 0

Long term (once the API-based server is done) I think I need to:
  - make the web server be the player node
  - rewrite the node (server side component, not this file here) as a FastAPI controller that plays the sound when a URL is hit
  - this component should have a URL param, which can be "sticky" as well as a file name param
  - the component should query the server for all of the sound files available
  - it can then download and parse the file to get the needed details (duration, etc.) for WaveSurfer
  - the component, or another, should provide an upload form to add new sounds -- actually, probably full-on CRUD for sound files
  - support clip seeking (playing from start_ms > 0 and stop_ms < duration)

Future / maybe:
  - Add component that let's you select & save clips from a longer audio file. E.g. show full waveform for whole file. Give controls for selecting and playing back sections of the file, then saving that selected portion to a standalone file. It could automatically upload them to the server, or if that's not implemented to the local public/audio_clips path.
*/
import React, { Component } from "react";
import Select from "react-select";

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const audioCtx = new AudioContext();
let buffer;

import { clips } from "../../../public/clips";

const { useRef, useState, useEffect, useCallback } = React;

const dot = (color = "#ccc") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const colorStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    fontSize: "8pt",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.value);
    return {
      ...styles,
      fontSize: "8pt",
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.value
        : isFocused
        ? chroma.contrast(color, "white") > 2
          ? color.alpha(0.1).css()
          : "#ccc"
        : null,
      color: isDisabled
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : chroma.contrast(color, "white") > 2
        ? data.value
        : "black",
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor:
          !isDisabled && (isSelected ? data.value : color.alpha(0.3).css()),
      },
    };
  },
  input: (styles) => ({ ...styles, ...dot() }),
  placeholder: (styles) => ({ ...styles, ...dot() }),
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.value) }),
};
const animationStyles = {
  control: (styles) => ({ ...styles, fontSize: "8pt" }),
  option: (styles) => ({ ...styles, fontSize: "8pt", padding: "4pt" }),
};

const animations = []; // to be populated with contents of public/clips.js

class AudioNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      waveformId: `waveform-${+new Date()}`,
      filename: "",
      nodeText: "",
      animations: [],
      animationIndex: this.props.index,
      startMs: 0,
      duration: 0,
      mqttName: this.props.mqttName,
      type: this.props.type,
      nodeIndex: this.props.index,
      channelIndex: this.props.channelIndex,
    };
    if (this.props.initialProperties) {
      let animationIndex = animations.findIndex(
        (item) => item.value === this.props.initialProperties.animation
      );
      let nodeText =
        this.props.initialProperties.filename +
        "\nD: " +
        this.props.initialProperties.duration;
      this.state = {
        show: false,
        waveformId: this.props.initialProperties.waveformId,
        nodeText: nodeText,
        filename: this.props.initialProperties.filename,
        animationIndex: animationIndex,
        duration: this.props.initialProperties.duration,
        mqttName: this.props.mqttName,
        type: this.props.type,
        nodeIndex: this.props.initialProperties.nodeIndex,
        channelIndex: this.props.channelIndex,
      };
    }
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleShow = () => {
    this.setState({ show: true });
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  handleSave = () => {
    let nodeText = this.state.filename + "\nD: " + this.state.duration;
    this.setState({
      show: false,
      nodeText: nodeText,
    });
    this.props.saveNodeConfig(this.state);
  };
  handleDelete = () => {
    this.props.removeNode(this.state, this.props.channelIndex);
  };

  setAnimationType(fn) {
    this.setState({
      animation: fn,
      filename: fn,
      animationIndex: 0,
    });
  }
  setDuration(newValue) {
    if (newValue) {
      this.setState({ duration: parseInt(newValue) });
    }
  }
  setStartMs(newValue) {
    if (newValue) {
      this.setState({ startMs: parseInt(newValue) });
    }
  }
  componentDidMount() {
    if (animations.length == 0) {
      clips.forEach((clip) =>
        animations.push({
          label: clip,
          value: clip,
          description: "Play the specified sound file",
        })
      );
    }
  }

  getAudioDetailsContainer() {
    if (!this.state.filename) {
      return null;
    }

    var audio = new Audio();
    // audio.onloadedmetadata = function () {
    //   console.log(
    //     "Loaded metadata for %s, duration=%s",
    //     soundUrl,
    //     audio.duration
    //   );
    //   audio = null;
    // };
    audio.src = `../../../audio_clips/${this.state.filename}`;
    return (
      <div>
        <div className="audio-filename">{this.state.filename}</div>
        <div className="audio-details">D: {audio.duration} sec</div>
      </div>
    );
    console.log(audio);
  }

  render() {
    let nodeWidth = Math.max(this.state.duration * 10, 100);
    return (
      <>
        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          animation={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Audio Animation Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={8}>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Sound file"
                    options={animations}
                    styles={animationStyles}
                    id="filename"
                    value={this.state.filename}
                    onChange={(e) => this.setAnimationType(e.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Start ms
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    id="startms"
                    value={this.state.startMs || 0}
                    onChange={(e) => this.setStartMs(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (milliseconds)
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Stop ms
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    id="stopms"
                    value={this.state.duration}
                    onChange={(e) => this.setDuration(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (0 = to end of clip)
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={this.handleSave}
              disabled={!this.state.animation}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="node-wrapper" style={{ width: nodeWidth + "px" }}>
          <div className="removeNode">
            <Button variant="outline-danger" size="sm">
              <FontAwesomeIcon
                icon={faMinusCircle}
                onClick={() => {
                  this.handleDelete();
                }}
              />
            </Button>
          </div>
          <div className="node-inner-wrapper" onClick={this.handleShow}>
            {this.state.filename ? (
              <div className="audio-container">
                {this.getAudioDetailsContainer()}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </>
    );
  }
}

export default AudioNode;
