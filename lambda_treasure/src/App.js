import React, { Component } from 'react';
import './App.css';
// import axios from 'axios';

import Display from './components/display.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Display />
        </header>
      </div>
    );
  }
}

export default App;
