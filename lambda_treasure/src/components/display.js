import React, { Component } from 'react';
import axios from 'axios';

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
            room_id: "",
            title: "",
            description: "",
            messages: [],
            input: ""
        }
    };
    componentDidMount() {
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
              messages: res.data.messages
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
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
            <div>
                <h2>Coordinates: {this.state.coordinates}</h2>
                <h2>Exits: {this.state.exits}</h2>
                <h2>Room Id: {this.state.room_id}</h2>
                <h2>Title: {this.state.title}</h2>
                <h2>Description: {this.state.description}</h2>
                <h2>Messages: {this.state.messages > 0 ? this.state.messages: "No messages"}</h2>

                <form onSubmit={this.move}>
                    <label>Move n, s, e, w: </label>
                    <input type="text" value={input} onChange={this.handleInputChange} />
                    <button type="submit">Move</button>
                </form>
            </div>
        );
    }
}

export default Display;

