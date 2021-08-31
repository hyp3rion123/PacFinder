import React, { Component } from "react";
import './PopUp.css'

export default class PopUp extends Component {
    clickHandler = () => {
        this.props.toggle();
    }

    render() {
        return (
            <div className="helpWrapper">                 
                <div className="helpBody">      
                <div className="closeButton" onClick={() => {this.clickHandler()}}>&times;</div>  
                <br/>        
                    Tips: 
                    <br/>
                    <br/>
                    1. Click and drag the start(yellow) and end(red) nodes to move them around
                    <br/>
                    <br/>
                    2. Make your own walls by clicking and dragging on any empty tile. You can erase walls by clicking and dragging on them.
                    <br/>
                    <br/>
                    3. After generating a maze, you can still move the start/end nodes around and over walls. You can also delete the generated walls and add your own.
                    <br/>
                    <br/>
                    4. At any point in time, you can reset the simulation and start from a clean slate.
                </div>
            </div>
        );
    }
}