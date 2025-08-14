import React, { Component } from "react";

const Connection = ({id, x1, y1, x2, y2, onSelectConnection, isSelected}) => {

  return (
    <line 
      key={id}
      id={id}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isSelected ? "dodgerblue" : "black"}
      strokeWidth={isSelected ? "7" : "5"}
      cursor="pointer"
      onClick={() => onSelectConnection(id)}
      tabIndex={0}
      style={{ pointerEvents: 'auto' }}
    />
  )
}

export default React.memo(Connection);
