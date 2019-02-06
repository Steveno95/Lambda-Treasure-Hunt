import React, { Component } from 'react';
import axios from 'axios';
// import styled from 'styled-components';
// import logo from '../images/logo.png';
// import { isNull } from 'util';

class GraphMap extends Component {
  state = {
    coords: { x: 50, y: 60 },
    error: '',
    exits: [],
    generating: false,
    graph: {},
    revDirections: { n: 's', s: 'n', w: 'e', e: 'w' },
    message: '',
    path: [],
    progress: 0,
    room_id: 0
  };

  componentDidMount() {
    // GET CURRENT LOCATION
    // if graph in local storage update state
    if (localStorage.hasOwnProperty('graph')) {
      let value = JSON.parse(localStorage.getItem('graph'));
      this.setState({ graph: value });
    }
    this.getLocation();
  }

  traverseMap = () => {
    let unknonwnDirections = this.getUnknownDirections();

    if (unknonwnDirections.length) {
      let move = unknonwnDirections[0];
      this.moveRooms(move);
    }
  };

  getUnknownDirections = () => {
    let unknownDirections = [];
    let directions = this.state.graph[this.state.room_id][1];
    console.log(`DIRECTIONS: ${directions}`);
    for (let direction in directions) {
      if (directions[direction] === '?') {
        unknownDirections.push(direction);
      }
    }
    return unknownDirections;
  };

  moveRooms = async move => {
    try {
      const response = await axios({
        method: 'post',
        url: `https://lambda-treasure-hunt.herokuapp.com/api/adv/move/`,
        headers: {
          Authorization: 'Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a'
        },
        data: {
          direction: move
        }
      });

      let previous_room_id = this.state.room_id;
      //   Update graph
      let graph = this.updateGraph(
        response.data.room_id,
        this.parseCoords(response.data.coordinates),
        response.data.exits,
        previous_room_id,
        move
      );

      this.setState({
        room_id: response.data.room_id,
        coords: this.parseCoords(response.data.coordinates),
        exits: [...response.data.exits],
        path: [...this.state.path, move],
        graph
      });
      console.log(response.data);
      console.log(previous_room_id);
      console.log(this.state.room_id);
    } catch (error) {
      console.log('Something went wrong moving...');
    }
  };

  getLocation = () => {
    axios({
      method: 'get',
      url: 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/',
      headers: {
        Authorization: 'Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a'
      }
    })
      .then(res => {
        let graph = this.updateGraph(
          res.data.room_id,
          this.parseCoords(res.data.coordinates),
          res.data.exits
        );
        this.setState(prevState => ({
          room_id: res.data.room_id,
          coords: this.parseCoords(res.data.coordinates),
          exits: [...res.data.exits],
          graph
        }));
      })
      .catch(err => console.log('There was an error.'));
  };

  updateGraph = (id, coords, exits, previous_room_id = null, move = null) => {
    const { revDirections } = this.state;

    let graph = Object.assign({}, this.state.graph);
    if (!this.state.graph[id]) {
      let payload = [];
      payload.push(coords);
      const moves = {};
      exits.forEach(exit => {
        moves[exit] = '?';
      });
      payload.push(moves);
      graph = { ...graph, [id]: payload };
    }
    if (previous_room_id && move) {
      graph[previous_room_id][1][move] = id;
      graph[id][1][revDirections[move]] = previous_room_id;
    }

    localStorage.setItem('graph', JSON.stringify(graph));
    return graph;
  };

  parseCoords = coords => {
    const coordsObject = {};
    const coordsArr = coords.replace(/[{()}]/g, '').split(',');

    coordsArr.forEach(coord => {
      coordsObject['x'] = parseInt(coordsArr[0]);
      coordsObject['y'] = parseInt(coordsArr[1]);
    });

    return coordsObject;
  };

  handleClick = () => {
    this.setState({ generating: true });
    this.traverseMap();
    this.getLocation();
  };
  render() {
    const {
      coords
    } = this.state;
    let parsed = [];
    if (coords) {
      for (let coord in coords) {
        parsed.push(`${coord}: ${coords[coord]} `);
      }
    }
    return (
      <div>
        <button className="btn" onClick={this.handleClick}>
          Generate Map
        </button>
      </div>
    );
  }
}


export default GraphMap;
