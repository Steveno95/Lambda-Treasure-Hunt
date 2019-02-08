import React from 'react';
import './components.css';

const StatusDisplay = props => (
    <div>
        <p><strong>Name: </strong>{props.name}</p>
        <p><strong>Encumbrance: :</strong> {props.encumbrance}</p>
        <p><strong>Strength: </strong> {props.strength}</p>
        <p><strong>Speed: </strong> {props.speed}</p>
        <p><strong>Gold: </strong> {props.gold}</p>
        <p><strong>Inventory: </strong> {props.inventory}</p>
        
        <form onSubmit={props.manualMove}>
            <label>Move n, s, e, w: </label>
            <input type="text" value={props.input} onChange={props.handleInput} />
            <button className="submit-btn" type="submit">Move</button>
        </form>
        {/* <button className="btn" onClick={props.handleClick}>
            Travel Map
        </button> */}
        <button className="btn" onClick={props.pickUp}>
            Pick Up
        </button><button className="btn" onClick={props.sell}>
            Sell
        </button>
    </div>
);

export default StatusDisplay;