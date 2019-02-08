import React from 'react';

const StatusDisplay = ({
    encumbrance, 
    strength, 
    speed, 
    inventory, 
    gold, 
    name
}) => {
    return (
        <div>
            <p><strong>Name: </strong>{name}</p>
            <p><strong>Encumbrance: :</strong> {encumbrance}</p>
            <p><strong>Strength: </strong> {strength}</p>
            <p><strong>Speed: </strong> {speed}</p>
            <p><strong>Gold: </strong> {gold}</p>
            <p><strong>Inventory: </strong> {inventory}</p>
        </div>
    );
}

export default StatusDisplay;