// src/components/FlowchartCanvas.jsx
import { useState } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';

const FlowchartCanvas = ({ nodes, setNodes }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [offset, setOffset] = useState({x:0, y:0});
  const [startMouse, setStartMouse] = useState({x:0, y:0});

  const handleNodeMouseDown = (e, nodeId, nodeX, nodeY) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setStartMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setStartMouse({x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    // Panning Logic
    if (isPanning) {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;
      setPan(prevPan => ({
        x: prevPan.x + dx,
        y: prevPan.y + dy
      }));
      setStartMouse({ x: e.clientX, y: e.clientY }); // Update startMouse
    }
    // Node dragging logic
    else if (draggedNodeId) {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;
      setNodes(prevNodes => prevNodes.map(node => {
        if (node.id === draggedNodeId) {
          return {
            ...node,
            x: node.x + dx,
            y: node.y + dy,
          };
        }
        return node;
      }));
      setStartMouse({ x: e.clientX, y: e.clientY }); // Update startMouse
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null); // Critical to reset this state on mouse up
  };

  const handleConnectionMouseDown = (e, id) => {
    e.stopPropagation();

    console.log(`Connection point clicked on node: (${id})`);
  }

  return (
    <div
      // This div is the main container, it does NOT have a transform
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setIsPanning(true);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'lightgray',
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      />
      {nodes.map(node => (
        <FlowchartNode
          key={node.id}
          id={node.id}
          x={node.x + pan.x}
          y={node.y + pan.y}
          text={node.text}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
          handleConnectionMouseDown={handleConnectionMouseDown}
        />
      ))}
    </div>
  );
};

export default FlowchartCanvas;