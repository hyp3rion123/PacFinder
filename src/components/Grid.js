import React, { Component } from "react";
import Tile from "./Tile";
import {dijkstra} from './Dijkstra'
import "./Grid.css";

export default class Grid extends Component {
  constructor() {
    super();
    this.state = {
      currentGridTiles: [],
      isHoldingWall: false,
      isHoldingStart: false,
      isHoldingEnd: false,
      currentStartingPosition: { x: 19, y: 7 },
      currentEndingPosition: { x: 29, y: 7 },
      currentlyAnimating: false,
    };
  }
  width = 50; //not part of state because dimensions are fixed..for now
  height = 15;

  componentDidMount() {
    const emptyTileArray = this.generateEmptyTileArray();
    this.setState({ currentGridTiles: emptyTileArray });
  }

  handleMouseEnter = (x, y, e) => {
    e.preventDefault();
    if (this.state.isHoldingStart === true && !(x === this.state.currentEndingPosition.x && y === this.state.currentEndingPosition.y)) {
      let updatedArray = this.updatedTileArray(x, y, "start");
      this.setState({ currentGridTiles: updatedArray, isHoldingStart: true });
    } else if (this.state.isHoldingEnd === true && !(x === this.state.currentStartingPosition.x && y === this.state.currentStartingPosition.y)) {
      let updatedArray = this.updatedTileArray(x, y, "end");
      this.setState({ currentGridTiles: updatedArray, isHoldingEnd: true });
    } else if (this.state.isHoldingWall === true && !(x === this.state.currentStartingPosition.x && y === this.state.currentStartingPosition.y) && !(x === this.state.currentEndingPosition.x && y === this.state.currentEndingPosition.y)) {
      let updatedArray = this.updatedTileArray(x, y, "wall");
      this.setState({ currentGridTiles: updatedArray, isHoldingWall: true });
    }
  };

  handleMouseDown = (x, y, e) => {
    e.preventDefault();
    this.setState({ currentlyAnimating: false })
    if (x === this.state.currentStartingPosition.x && y === this.state.currentStartingPosition.y) {
      this.setState({ isHoldingStart: true })
    } else if (x === this.state.currentEndingPosition.x && y === this.state.currentEndingPosition.y) {
      this.setState({ isHoldingEnd: true })
    } else {
      let updatedArray = this.updatedTileArray(x, y, "wall");
      this.setState({ currentGridTiles: updatedArray, isHoldingWall: true });
    }    
  };

  handleMouseUp = (e) => {
    e.preventDefault();
    this.setState({ isHoldingWall: false, isHoldingStart: false, isHoldingEnd: false });
  };

  updatedTileArray(x, y, cmd) {
    let updatedArray = this.state.currentGridTiles.slice();
    if (!cmd.localeCompare("start") && !updatedArray[y][x].wall) { //make the origninal start a regular empty tile
      updatedArray[this.state.currentStartingPosition.y][this.state.currentStartingPosition.x] = {
        ...updatedArray[this.state.currentStartingPosition.y][this.state.currentStartingPosition.x],
        start: false,
      }
      updatedArray[y][x] = {
        ...updatedArray[y][x],
        start: true,
      }
      this.setState({ currentStartingPosition: { x: x, y: y }});
    } else if (!cmd.localeCompare("end") && !updatedArray[y][x].wall) { //make the origninal end a regular empty tile
      updatedArray[this.state.currentEndingPosition.y][this.state.currentEndingPosition.x] = {
        ...updatedArray[this.state.currentEndingPosition.y][this.state.currentEndingPosition.x],
        end: false,
      }
      updatedArray[y][x] = {
        ...updatedArray[y][x],
        end: true,
      }
      this.setState({ currentEndingPosition: { x: x, y: y }});
    } else {
      updatedArray[y][x] = {
        ...updatedArray[y][x],
        wall: !cmd.localeCompare("wall") ? !this.state.currentGridTiles[y][x].wall: this.state.currentGridTiles[y][x].wall,
        path: !cmd.localeCompare("path") ? true : false,
        exploring: !cmd.localeCompare("exploring") ? true : false,
        explored: !cmd.localeCompare("explored") ? true : false,
      };
    }
    return updatedArray;
  }

  generateEmptyTileArray = () => {
    let tileArray = [];
    for (let yRow = 0; yRow < this.height; yRow++) {
      tileArray[yRow] = [];
      for (let xCol = 0; xCol < this.width; xCol++) {
        const start = this.state.currentStartingPosition;
        const end = this.state.currentEndingPosition;
        tileArray[yRow][xCol] = {
          key: yRow * this.width + xCol,
          x: xCol,
          y: yRow,
          handleMouseEnter: this.handleMouseEnter,
          handleMouseDown: this.handleMouseDown,
          handleMouseUp: this.handleMouseUp,
          wall: false,
          path: false,
          exploring: false,
          explored: false,
          start: start.x === xCol && start.y === yRow ? true : false,
          end: end.x === xCol && end.y === yRow ? true : false,
        };
      }
    }
    return tileArray;
  };

  resetTileArray = () => {
    const emptyTileArray = this.generateEmptyTileArray();
    this.setState({ currentGridTiles: emptyTileArray, currentlyAnimating: false });
  };

  resetTiles = () => {
    this.resetTileArray();
  };

  getPath = async () => {
      const startX = this.state.currentStartingPosition.x;
      const startY = this.state.currentStartingPosition.y;
      const endX = this.state.currentEndingPosition.x;
      const endY = this.state.currentEndingPosition.y;
      const cloneGrid = this.state.currentGridTiles.slice();
      let responseDijkstra = await dijkstra(startX, startY, endX, endY, cloneGrid);
      return responseDijkstra;
  };

  visualizePath = async () => {
      const moves = await this.getPath();
      const timer = ms => new Promise(res => setTimeout(res, ms));
      this.setState({ currentlyAnimating: true })
      for (let move in moves) {
        if(!this.state.currentlyAnimating){
          const emptyTileArray = this.generateEmptyTileArray();
          this.setState({ currentGridTiles: emptyTileArray})
          return;
        }          
          await timer(1);
          const newArray = this.updatedTileArray(moves[move].x, moves[move].y, moves[move].state);
          this.setState({currentGridTiles: newArray});
      }
  }

  render() {
    return (
      <div className="gridWrapper">
        <button
          onClick={() => {
            this.resetTiles();
          }}
        >
          Reset
        </button>        
        <div className="grid">
          {this.state.currentGridTiles &&
            this.state.currentGridTiles.map((row) => {
              return row.map((tile) => {
                const {
                  key,
                  x,
                  y,
                  handleMouseDown,
                  handleMouseEnter,
                  handleMouseUp,
                  wall,
                  path,
                  exploring,
                  explored,
                  start,
                  end,
                } = tile;
                return (
                  <Tile
                    key={key}
                    x={x}
                    y={y}
                    handleMouseEnter={handleMouseEnter}
                    wall={wall}
                    path={path}
                    exploring={exploring}
                    explored={explored}
                    handleMouseDown={handleMouseDown}
                    handleMouseUp={handleMouseUp}
                    start={start}
                    end={end}
                  />
                );
              });
            })}
        </div>
        <button
          onClick={() => {
            this.visualizePath();
          }}
        >
          Visualize Dijkstra
        </button>
      </div>
    );
  }
}
