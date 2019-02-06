import React, { Component } from 'react';
import './App.css';

import Display from './components/display.js';
// import GraphMap from './components/map.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Display />
          {/* <GraphMap /> */}
          {/* <Route exact path='/' component={Display} />
          <Route path='/graph' component={GraphMap} /> */}
        </header>
      </div>
    );
  }
}

export default App;
