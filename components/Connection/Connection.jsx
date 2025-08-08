import React, { Component } from "react";

const Connection = ({id, x1, y1, x2, y2, setConnections}) => {
  const handleDelete = () => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  return (
    <line 
      key={id}
      id={id}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="5"
      cursor="pointer"
      onClick={handleDelete}
      tabIndex={0}
    />
  )
}

export default Connection;
