// src/components/FlowchartCanvas.jsx
import { useState, useRef } from 'react'

const FlowchartCanvas = () => {
  // state to store canvas position
  const [pan, setPan] = useState({x:0, y:0});
  // State to track if mouse is down for dragging
  const [isPanning, setIsPanning] = useState(false);
  // state to store starting position of mouse when drag begins
  const [startPan, setStartPan] = useState({x:0, y:0});

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({x: e.clientX, y: e.clientY});
  };

  const handleMouseMove = (e) => {
    if(!isPanning) return;

    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;

    setPan({
      x: pan.x + dx,
      y: pan.y + dy
    });

    setStartPan({x: e.clientX, y: e.clientY});
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'lightgray',
        cursor: isPanning ? 'grabbing' : 'grab',
        transform: `translate(${pan.x}px, ${pan.y}px)`,
        position: 'relative',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h2>FlowchartCanvas (Pan around me!)</h2>
    </div>
  );
};

export default FlowchartCanvas;