import React, { Component } from "react";
import "./Tile.css";

export default class Tile extends Component {
  setClassName = (wall, start, end, path, explored, exploring) => {
    if (wall) return "wall";
    else if (start) return "start";
    else if (end) return "end";
    else if (path) return "path";
    else if (explored) return "explored";
    else if (exploring) return "exploring";
    else return "empty";
  };
  render() {
    const x = this.props.x;
    const y = this.props.y;
    const handleMouseEnter = this.props.handleMouseEnter;
    const handleMouseDown = this.props.handleMouseDown;
    const handleMouseUp = this.props.handleMouseUp;
    const name = this.setClassName(
      this.props.wall,
      this.props.start,
      this.props.end,
      this.props.path,
      this.props.explored,
      this.props.exploring
    );
    return (
      <div
        className={name}
        onMouseEnter={(e) => {
          handleMouseEnter(x, y, e);
        }}
        onMouseDown={(e) => {
          handleMouseDown(x, y, e);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
        }}
      ></div>
    );
  }
}
