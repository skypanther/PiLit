import React, { Component } from "react";

class Stage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: "bar",
    };
  }

  render() {
    return <div id="stage-wrapper"></div>;
  }
}

export default Stage;
