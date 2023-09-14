import React, { Component } from "react";

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
