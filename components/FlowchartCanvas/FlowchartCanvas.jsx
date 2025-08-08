// src/components/FlowchartCanvas.jsx
import { useState, useRef } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';

const FlowchartCanvas = ({ nodes, setNodes, connections, setConnections }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [offset, setOffset] = useState({x:0, y:0});
  const [startMouse, setStartMouse] = useState({x:0, y:0});
  const [tempConnection, setTempConnection] = useState(null);
  const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
  const svgRef = useRef(null);

  const handleNodeKeyDown = (e, id) => {
    console.log(`Key pressed on node ${id}: `, e.key);

    if(e.key === 'Enter') {
      e.preventDefault();

      if(selectedConnectionSource === id) {
        // if same node selected again, deselect it
        setSelectedConnectionSource(null);
      } else if (selectedConnectionSource) {
        // if source already selected, create new connection to this node
        const newConnection = {
          id: `conn-${Date.now()}`,
          source: selectedConnectionSource,
          target: id,
        };
        setConnections(prev => [...prev, newConnection]);
        setSelectedConnectionSource(null);
      } else { // set the selected connection source
        setSelectedConnectionSource(id);
      }
    }

    console.log(`Selected Source: ${selectedConnectionSource}`)
  };

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
    } else if (tempConnection) {
      setTempConnection(prev => ({
        ...prev,
        x2: e.clientX - pan.x,
        y2: e.clientY - pan.y,
      }));
    }
  };

  const handleMouseUp = (e) => {
    // logic for handling a connection
    if (tempConnection) {
      // find element under cursor
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      const targetNodeElement = elementsUnderCursor.find(el => el.classList.contains('connection-point'));
      
      // if target connection point found and not the same as source,
      if(targetNodeElement) {
        // retrieve node id from DOM's data attribute
        const targetId = targetNodeElement.parentElement.id;

        if(targetId && targetId !== tempConnection.sourceId) {
          const newConnection = {
            id: `conn-${Date.now()}`,
            source: tempConnection.sourceId,
            target: targetId,
          };
          setConnections(prev => [...prev, newConnection])
        }
      }

      setTempConnection(null);
    }
    setIsPanning(false);
    setDraggedNodeId(null); // Critical to reset this state on mouse up
  };

  const handleConnectionMouseDown = (e, id) => {
    e.stopPropagation();

    const sourceNode = nodes.find(n => n.id === id);
    setTempConnection({
      sourceId: id,
      x1: sourceNode.x + 60 + pan.x,
      y1: sourceNode.y + 45 + pan.y,
      x2: e.clientX,
      y2: e.clientY,
    });

    console.log(`Connection point clicked on node: (${id})`);
  };

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
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
      {/* Render permanent connections */}
      {
        connections.map( conn => {

        const sourceNode = nodes.find(n => n.id === conn.source);
        const targetNode = nodes.find(n => n.id === conn.target);

        // only render if both nodes exist
        if (sourceNode && targetNode) {
          return (
              <line
                key={conn.id}
                x1={sourceNode.x + 60 + pan.x} // Center of the source node
                y1={sourceNode.y + 45 + pan.y} // Bottom of the source node
                x2={targetNode.x + 60 + pan.x} // Center of the target node
                y2={targetNode.y + 45 + pan.y} // Bottom of the target node
                stroke="black"
                strokeWidth="2"
                />
            );
        }

      })}
      {/* conditionally render only if tempConnection exists */}
      { tempConnection && (
        <line
          x1 = {tempConnection.x1 + pan.x}
          y1 = {tempConnection.y1 + pan.y}
          x2 = {tempConnection.x2}
          y2 = {tempConnection.y2}
          stroke="black"
          strokeWidth="2"
        />)
      }
      </svg>
      {nodes.map(node => (
        <FlowchartNode
          key={node.id}
          id={node.id}
          x={node.x + pan.x}
          y={node.y + pan.y}
          text={node.text}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
          handleConnectionMouseDown={handleConnectionMouseDown}
          handleNodeKeyDown={handleNodeKeyDown}
        />
      ))}
    </div>
  );
};

export default FlowchartCanvas;