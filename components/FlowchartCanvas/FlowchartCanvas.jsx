// src/components/FlowchartCanvas.jsx
import { useState, useRef } from 'react'
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';

const FlowchartCanvas = ({nodes, setNodes}) => {
  // state to store canvas position
  const [pan, setPan] = useState({x:0, y:0});
  // State to track if mouse is down for dragging
  const [isPanning, setIsPanning] = useState(false);
  // state to store starting position of mouse when drag begins
  const [startPan, setStartPan] = useState({x:0, y:0});
  // state and handlers for dragging nodes
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  }

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({x: e.clientX, y: e.clientY});
  };

  const handleMouseMove = (e) => {
    // Panning logic: If no node is being dragged, continue with canvas panning.
    if (!draggedNodeId && isPanning) {
        if(!isPanning) return;

        const dx = e.clientX - startPan.x;
        const dy = e.clientY - startPan.y;

        setPan({
          x: pan.x + dx,
          y: pan.y + dy
        });

        setStartPan({x: e.clientX, y: e.clientY});
        return;
    }

    // Node dragging logic: If a node is being dragged, update its position.
    if (draggedNodeId) {
        // Find the node being dragged
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.id === draggedNodeId) {
                return {
                    ...node,
                    x: node.x + e.movementX, // movementX and Y are great for this
                    y: node.y + e.movementY
                };
            }
            return node;
        }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
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
      {nodes.map(node => (<FlowchartNode
          key={node.id}
          id={node.id}
          x={node.x}
          y={node.y}
          text={node.text}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
        />
      ))}
    </div>
  );
};

export default FlowchartCanvas;