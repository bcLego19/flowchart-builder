import React, { Component } from "react";

const Connection = ({id, x1, y1, x2, y2, onSelectConnection, isSelected, sourceText, targetText}) => {

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // prevent default action
      e.preventDefault();
      // call selection handler function
      onSelectConnection(id);
    }
  }

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
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ pointerEvents: 'auto' }}
      aria-label={`Connection from ${sourceText} to ${targetText}`}
    />
  )
}

export default React.memo(Connection);
