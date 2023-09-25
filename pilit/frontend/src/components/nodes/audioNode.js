import React, { Component } from "react";
import Select from "react-select";

import WaveSurfer from "wavesurfer.js";
import "./Waveform.css";

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

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

class AudioNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      waveformId: `waveform-${+new Date()}`,
      filename: "",
      nodeText: "",
      animationIndex: this.props.index,
      duration: 10,
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

  setAnimationType(animObj) {
    let animationIndex = animations.findIndex(
      (item) => item.value === animObj.value
    );
    this.setState({
      animation: animObj.value,
      animationIndex: animationIndex,
    });
  }
  setDuration(newValue) {
    if (newValue) {
      this.setState({ duration: parseInt(newValue) });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { props, waveSurfer } = this;

    if (!waveSurfer) {
      return;
    }

    if (props.playbackSpeed !== nextProps.playbackSpeed) {
      console.log(nextProps.playbackSpeed);
      waveSurfer.setPlaybackRate(nextProps.playbackSpeed / 100);
    }

    if (props.renderData !== nextProps.renderData) {
      this.performWithoutSeek(() => {
        if (nextProps.renderData) {
          const { currentFrame, sequence } = nextProps;
          waveSurfer.seekTo(currentFrame / sequence.frameCount);
          waveSurfer.play();
        } else {
          waveSurfer.stop();
        }
      });
    }
  }

  componentDidMount() {
    const { sequence } = this.props;
    if (sequence) {
      const waveSurfer = new WaveSurfer(this.getWaveSurferProperties());
      this.waveSurfer = waveSurfer;

      waveSurfer.init();

      const url = `${restConfig.ROOT_URL}/sequences/${sequence.id}/songAudio`;
      waveSurfer.load(url);
      waveSurfer.on("audioprocess", this.publishRenderedFrame);
      waveSurfer.on("seek", this.selectFrame);
    }
  }

  componentWillUnmount() {
    this.waveSurfer.destroy();
  }

  performWithoutSeek = (callback) => {
    this.waveSurfer.un("seek");
    callback();
    this.waveSurfer.on("seek", this.selectFrame);
  };

  getWaveSurferProperties() {
    return {
      container: "#" + this.state.waveformId,
      cursorWidth: 0,
      height: 50,
      waveColor: "#fff",
      progressColor: "#fff",
    };
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
            <Modal.Title>Pixel Animation Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={8}>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Animation"
                    options={animations}
                    styles={animationStyles}
                    value={
                      this.state.animationIndex !== null
                        ? animations[this.state.animationIndex]
                        : null
                    }
                    onChange={(e) => this.setAnimationType(e)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={3} className="modal-label">
                  Duration
                </Col>
                <Col xs={3}>
                  <Form.Control
                    type="text"
                    className="form-control"
                    value={this.state.duration}
                    onChange={(e) => this.setDuration(e.target.value)}
                  />
                </Col>
                <Col xs={6} className="modal-label">
                  {" "}
                  (seconds)
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
            <div className="WaveformContainer">
              <div
                id={this.state.waveformId}
                className="Waveform"
                style={{ nodeWidth }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default OnOffNode;
