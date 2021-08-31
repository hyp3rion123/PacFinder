import React, { Component } from "react";
import Tile from "./Tile";
import {dijkstra} from './Dijkstra'
import {prim} from './Prim'
import "./Grid.css";
import PopUp from "./PopUp";

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
      mazeGenerated: false,
      seeHelp: false
    };
  }
  width = 50; //not part of state because dimensions are fixed..for now
  height = 15;

  componentDidMount() {
    const emptyTileArray = this.generateEmptyTileArray("hard");
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
      let updatedArray = this.updatedTileArray(x, y, "manualWall");
      this.setState({ currentGridTiles: updatedArray, isHoldingWall: true });
    }
  };

  handleMouseDown = (x, y, e) => {
    e.preventDefault();
    if (!this.state.currentlyAnimating) {
      if (x === this.state.currentStartingPosition.x && y === this.state.currentStartingPosition.y) {
        this.setState({ isHoldingStart: true })
        this.resetTileArray("soft");
      } else if (x === this.state.currentEndingPosition.x && y === this.state.currentEndingPosition.y) {
        this.setState({ isHoldingEnd: true })
        this.resetTileArray("soft");
      } else {
        let updatedArray = this.updatedTileArray(x, y, "manualWall");
        this.setState({ currentGridTiles: updatedArray, isHoldingWall: true });
      }  
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
    } else if (!cmd.localeCompare("manualWall") && !this.state.isHoldingStart && !this.state.isHoldingEnd){
      updatedArray[y][x] = {
        ...updatedArray[y][x],
        wall: !this.state.currentGridTiles[y][x].wall
      };
    } else if (cmd.localeCompare("start") !== 0 && cmd.localeCompare("end") !== 0) {
      let wall = false;
      if (!cmd.localeCompare("wall")) {
        wall = !this.state.currentGridTiles[y][x].wall;
      }
      updatedArray[y][x] = {
        ...updatedArray[y][x],
        wall: wall,
        path: !cmd.localeCompare("path") ? true : false,
        exploring: !cmd.localeCompare("exploring") ? true : false,
        explored: !cmd.localeCompare("explored") ? true : false,
      };
    }
    return updatedArray;
  }

  generateEmptyTileArray = (cmd) => {
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
          wall: !cmd.localeCompare("soft") ? this.state.currentGridTiles[yRow][xCol].wall : false,
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

  resetTileArray = (cmd) => { //cmd: "soft" indicates only path/explored tiles are reset, "hard" indicates everything other than start/end is reset
    const emptyTileArray = this.generateEmptyTileArray(cmd);
    this.setState({ currentGridTiles: emptyTileArray, currentlyAnimating: false });
  };

  dijkstraButtonClick = () => {
    if (!this.state.currentlyAnimating){
      this.resetTileArray("soft");
      this.visualizePath("findPath");
    }    
  }
  
  generateMazeButtonClick = () => {
    //this.resetTileArray("soft");
    this.visualizePath("generateMaze");
  }

  getPath = async () => {
      const startX = this.state.currentStartingPosition.x;
      const startY = this.state.currentStartingPosition.y;
      const endX = this.state.currentEndingPosition.x;
      const endY = this.state.currentEndingPosition.y;
      const cloneGrid = this.state.currentGridTiles.slice();
      let responseDijkstra = await dijkstra(startX, startY, endX, endY, cloneGrid);
      return responseDijkstra;
  };

  visualizePath = async (cmd) => {
    if(!this.state.currentlyAnimating) {
      const moves = !cmd.localeCompare("findPath") ? await this.getPath() : await this.createMaze();
      const timer = ms => new Promise(res => setTimeout(res, ms));
      this.setState({ currentlyAnimating: true })
      for (let move in moves) {
        if(!this.state.currentlyAnimating){
          const emptyTileArray = this.generateEmptyTileArray("soft");
          this.setState({ currentGridTiles: emptyTileArray})
          return;
        }          
          await timer(0.001);
          const newArray = this.updatedTileArray(moves[move].x, moves[move].y, moves[move].state);
          
          this.setState({currentGridTiles: newArray});
      }
      this.setState({ currentlyAnimating: false })
    }
  }

  createMaze = async () => {
    let grid = this.state.currentGridTiles;
    let start = this.state.currentStartingPosition;
    let end = this.state.currentEndingPosition;
    grid.map(row => {
      row.map(tile => {
          if (!(tile.x === start.x && tile.y === start.y) && !(tile.x === end.x && tile.y === end.y)) {
              tile.weight = Math.random();
              tile.wall = true;
          }            
      })
    })
    const cloneGrid = JSON.parse(JSON.stringify(this.state.currentGridTiles)); //create a copy - don't want to pass by reference and edit the same array
    let responseMaze = await prim(this.state.currentStartingPosition, this.state.currentEndingPosition, cloneGrid);
    return responseMaze;
  }

  displayHelp = async () => {
    this.setState({
      seeHelp: !this.state.seeHelp
    })
  }

  render() {
    return (
      <div className="gridWrapper">
        {this.state.seeHelp ? <PopUp toggle={this.displayHelp}/> : null}
          <button onClick={() => {this.displayHelp()}}>          
              Help
          </button>        
          <button
            onClick={() => {
              this.resetTileArray("hard");
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
              this.dijkstraButtonClick();
            }}
          >
            Visualize Dijkstra
          </button>
          <button
            onClick={() => {
              this.generateMazeButtonClick();
            }}
          >
            Generate Random Maze
          </button>
      </div>
    );
  }
}
