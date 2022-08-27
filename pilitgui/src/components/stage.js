import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ShowDetails from "./showdetails";

class Stage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: "bar",
    };
  }

  render() {
    return (
      <div id="stage-wrapper">
        This is the stage, where you'll see previews of the show elements
        (nodes).
      </div>
    );
  }
}

export default Stage;
