import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import TitleBar from './components/titlebar';
import Row from './components/row';

class App extends Component {
  render() {
    return (
        <div className="App">
          <TitleBar />
          <div id="contents-wrapper">
            <h1>Welcome to React Parcel Micro App!</h1>
            <Row />
          </div>
        </div>
    )
  }
}

export default App;