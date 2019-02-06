import React, { Component } from 'react';
import axios from 'axios';
import '../App.css'
import GraphMap from './map.js'

const config = {
    headers: {
        Authorization: "Token 41a3f69a50a420f3cd78bc17def49bfeff971d5a"
    }
};

class Display extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coordinates: "",
            exits: [],
            room_id: 0,
            title: "",
            description: "",
            messages: [],
            players: [],
            items: [],
            input: ""
        }
    };

    init() {
        axios
        .get("https://lambda-treasure-hunt.herokuapp.com/api/adv/init", config)
        .then(res => {
          if (res.status === 200 && res.data) {
              console.log(res)
            this.setState({
              coordinates: res.data.coordinates,
              exits: res.data.exits,
              room_id: res.data.room_id,
              title: res.data.title,
              description: res.data.description,
              players: res.data.players,
              items: res.data.items,
              messages: res.data.messages
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    componentDidMount() {
        this.init();
    }

    handleInputChange = e => {
        this.setState({ input: e.target.value });
      };
    
      move = e => {
        e.preventDefault();
        const { input } = this.state;
        const data_input = { direction: input };
    
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
            <div className="info-display">
                <h3>Coordinates: {this.state.coordinates}</h3>
                <h3>Exits: {this.state.exits}</h3>
                <h3>Room Id: {this.state.room_id}</h3>
                <h3>Title: {this.state.title}</h3>
                <h3>Description: {this.state.description}</h3>
                <h3>Items In Room: {this.state.items}</h3>
                <h3>Messages: {this.state.messages}</h3>
                <h3 className="players">Other Players: {this.state.players} </h3>

                <form onSubmit={this.move}>
                    <label>Move n, s, e, w: </label>
                    <input type="text" value={input} onChange={this.handleInputChange} />
                    <button type="submit">Move</button>
                </form>
                <div>
                    <GraphMap />
                </div>
            </div>
            
        );
    }
}

export default Display;

