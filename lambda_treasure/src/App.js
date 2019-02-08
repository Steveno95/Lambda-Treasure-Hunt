import React, { Component } from 'react';
import './App.css';

//import Display from './components/display.js';
import GraphMap from './components/map.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <GraphMap />
        </header>
      </div>
    );
  }
}

export default App;
