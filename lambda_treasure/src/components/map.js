import React, { Component } from 'react';
import axios from 'axios';
// import styled from 'styled-components';
// import logo from '../images/logo.png';
// import { isNull } from 'util';

class GraphMap extends Component {
  state = {
    url : "https://lambda-treasure-hunt.herokuapp.com/api/adv/",
    config: { headers: { "Authorization":"Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a"}},
    coords: { x: 50, y: 60 },
    cooldown: 5,
    error: '',
    exits: [],
    players : [],
    generating: false,
    graph: {},
    revDirections: { n: 's', s: 'n', w: 'e', e: 'w' },
    message: '',
    path: [],
    progress: 0,
    room_id: 0,
    visited: new Set(),
    input : ''
  }

  componentDidMount() {
    // finds map in local storage and saves it to graph object
    if (localStorage.hasOwnProperty('map')) {
      let value = JSON.parse(localStorage.getItem('map'));
      this.setState({ graph: value });
    }

    this.initReq();
  }

  traverseMap = () => {
    let unknownDirections = this.unexploredDirections();
    if (unknownDirections.length) {
      let move = unknownDirections[0];
      this.moveRoomsByID(move);
    } else {
      clearInterval(this.interval);
      let path = this.shortestPath();
      let count = 1;
      for (let direction of path) {
        console.log(direction);
        for (let d in direction) {
          setTimeout(() => {
            this.moveRoomsByID(d);
          }, this.state.cooldown * 1000 * count);
          count++;
        }
      }
      console.log('here');
      this.interval = setInterval(
        this.traverseMap,
        this.state.cooldown * 1000 * count
      );
      count = 1;
    }

    this.updateVisited();
  };

  updateVisited = () => {
    // UPDATE PROGRESS
    let visited = new Set(this.state.set);
    for (let key in this.state.graph) {
      if (!visited.has(key)) {
        let qms = [];
        for (let direction in key) {
          if (key[direction] === '?') {
            qms.push(direction);
          }
        }
        if (!qms.length) {
          visited.add(key);
        }
      }
    }
    let progress = visited.size / 500;
    this.setState({ visited, progress });
  };

  shortestPath = (start = this.state.room_id, target = '?') => {
    let { graph } = this.state;
    let queue = [];
    let visited = new Set();
    for (let room in graph[start][1]) {
      queue = [...queue, [{ [room]: graph[start][1][room] }]];
    }

    while (queue.length) {
      let dequeued = queue.shift();

      let last_room = dequeued[dequeued.length - 1];

      for (let exit in last_room) {
        if (last_room[exit] === target) {
          dequeued.pop();
          return dequeued;
        } else {
          visited.add(last_room[exit]);

          for (let path in graph[last_room[exit]][1]) {
            if (visited.has(graph[last_room[exit]][1][path]) === false) {
              let path_copy = Array.from(dequeued);
              path_copy.push({ [path]: graph[last_room[exit]][1][path] });

              queue.push(path_copy);
            }
          }
        }
      }
    }
  };

  unexploredDirections = () => {
    let unknownDirections = [];
    let directions = this.state.graph[this.state.room_id][1];
    for (let direction in directions) {
      if (directions[direction] === '?') {
        unknownDirections.push(direction);
      }
    }
    return unknownDirections;
  };

  moveRoomsByID = async (move, next_room_id = null) => {
    let data;
    if (next_room_id) {
      data = {
        direction: move,
        next_room_id: toString(next_room_id)
      };
    } else {
      data = {
        direction: move
      };
    }
    try {
      const response = await axios({
        method: 'post',
        url: `https://lambda-treasure-hunt.herokuapp.com/api/adv/move/`,
        headers: {
          Authorization: "Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a"
        },
        data
      });

      let previous_room_id = this.state.room_id;
      console.log(`PREVIOUS ROOM: ${previous_room_id}`);
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
        cooldown: response.data.cooldown,
        graph
      });
      console.log(response.data);
    } catch (error) {
      console.log('Something went wrong moving...');
    }
  };

  initReq = () => {
    axios.get(`${this.state.url}init`, this.state.config)
      .then(res => {
        this.updateState(res.data)
        let graph = this.updateGraph(
          res.data.room_id,
          this.parseCoords(res.data.coordinates),
          res.data.exits
        );
        this.setState(prevState => ({
          room_id: res.data.room_id,
          coords: this.parseCoords(res.data.coordinates),
          exits: [...res.data.exits],
          ooldown: res.data.cooldown,
          graph
        }));
        this.updateVisited();
      })
      .catch(err => console.log('There was an error.'));
  };

  updateGraph = (id, coords, exits, prev = null, move = null) => {
    const { revDirections } = this.state;

    let graph = Object.assign({}, this.state.graph);
    if (!this.state.graph[id]) {
      let arr = [];
      arr.push(coords);
      const moves = {};
      exits.forEach(exit => {
        moves[exit] = '?';
      });
      arr.push(moves);
      graph = { ...graph, [id]: arr };
    }
    if (prev !== null && move && prev !== id) {
      graph[prev][1][move] = id;
      graph[id][1][revDirections[move]] = prev;
    }

    localStorage.setItem('map', JSON.stringify(graph));
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

  updateState = res => {
    if('room_id' in res){
      this.setState({
        room_id: res.room_id,
        exits: res.exits,
        // coords: res.coordinates,
        cooldown: res.cooldown,
        players: res.players
      });
    }else{
      console.log(res)
    }
  };

  handleClick = () => {
    this.setState({ generating: true });
    this.interval = setInterval(this.traverseMap, this.state.cooldown * 1000);
  };

  moveToRoom = room =>{
    let current = this.state.room_id
    let current_coords = this.state.coords
    let target_coords = this.state.graph[`${room}`][0]
    let differencex = current_coords['x'] - target_coords['x']
    let differencey = current_coords['y'] - target_coords['y']
    console.log(differencex, differencey)

  }

  moveRooms = dir => {
    console.log("called!")
    let c = this.state.config
    // had to do this to call it in post request
    axios.post(`${this.state.url}move`, {direction: dir}, c)
    .then(res => {
      console.log(res.data)
      this.updateState(res.data)
    })
    .catch(err => {
      console.log(err);
    });
  };

  handleInputChange = e => {
    this.setState({ input: e.target.value });
  };

  manualMove = e => {
    e.preventDefault();
    const { input } = this.state;
    const data_input = { direction: input };
    const config = {
      headers: {
          Authorization: "Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a"
      }
    };
    
    switch (input.toLowerCase()) {
      case "n":
      case "s":
      case "e":
      case "w":
        axios
          .post("https://lambda-treasure-hunt.herokuapp.com/api/adv/move/", data_input, config)
          .then(res => {
            console.log("POST res.data", res.data);
            this.setState({
              coordinates: res.data.coordinates,
              exits: res.data.exits,
              room_id: res.data.room_id,
              title: res.data.title,
              description: res.data.description,
              players: res.data.players,
              items: res.data.items,
              messages: res.data.messages,
              input: ""
            });
          })
          .catch(err => console.log(err));
        return;
      default:
        return;
    }
  };

  render() {
    const { input } = this.state
    return (
      <div className="App">
        <div className="side-menu">
          <div className="control-menu">
            <h2>Room Details</h2>
            <p><strong>Room ID: </strong>{this.state.room_id}</p>
            <p><strong>Players:</strong> <ol>{this.state.players.map(player => <li>{player}</li>)}</ol></p>
            <p><strong>Exits:</strong> {this.state.exits}</p>
            <p><strong>Coordinates: </strong> x:{this.state.coords['x']}, y:{this.state.coords['y']}</p>
            <p><strong>Exits:</strong> {this.state.exits}</p>
            <p><strong>Cooldown:</strong> {this.state.cooldown}</p>
            <form onSubmit={this.manualMove}>
               <label>Move n, s, e, w: </label>
               <input type="text" value={input} onChange={this.handleInputChange} />
               <button type="submit">Move</button>
            </form>
            <button className="btn" onClick={this.handleClick}>
              Traverse
            </button>
          </div>
        </div>
      </div>
    );
  }
}


export default GraphMap;
