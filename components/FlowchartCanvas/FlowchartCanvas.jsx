// src/components/FlowchartCanvas.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';
import Connection from '../Connection/Connection.jsx';
import ContextMenu from '../ContextMenu/ContextMenu.jsx';

const FlowchartCanvas = ({ nodes, setNodes, connections, setConnections }) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [startMouse, setStartMouse] = useState({x:0, y:0});
    const [tempConnection, setTempConnection] = useState(null);
    const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, nodeId: null});

    const canvasRef = useRef(null);

    const handleDeleteNode = useCallback((nodeId) => {
        setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
        setConnections(prevConnections =>
            prevConnections.filter(conn =>
                conn.source !== nodeId && conn.target !== nodeId
            )
        );
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    }, [setNodes, setConnections]);

    // New handler to clear all selections
    const handleClearSelection = (e) => {
        setDraggedNodeId(null);
        setSelectedConnectionSource(null);
        setEditingNodeId(null);
        setTempConnection(null);
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleContextMenu = (e, nodeId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            nodeId: nodeId,
        });
    };

    const handleNodeTextChange = (id, newText) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    };

    const handleDoubleClick = (nodeId) => {
        setEditingNodeId(nodeId);
    };

    const handleCanvasKeyDown = (e) => {
        if(e.key === 'Escape') {
            setSelectedConnectionSource(null);
        }
    };

    const handleNodeKeyDown = (e, id) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            if(selectedConnectionSource === id) {
                setSelectedConnectionSource(null);
            } else if (selectedConnectionSource) {
                const newConnection = {
                    id: `conn-${Date.now()}`,
                    source: selectedConnectionSource,
                    target: id,
                };
                setConnections(prev => [...prev, newConnection]);
                setSelectedConnectionSource(null);
            } else {
                setSelectedConnectionSource(id);
            }
        }
    };

    // Re-implemented mouse event handlers to work with the canvas div
    const handleMouseDown = (e) => {
        if (e.button === 0) { // Left-click
            // If the target is the canvas background, start panning
            if (e.target.id === 'flowchart-canvas-div') {
                setIsPanning(true);
                setStartMouse({x: e.clientX, y: e.clientY });
            }
            // Clear any selections on a left-click on the canvas
            setSelectedConnectionSource(null);
            setEditingNodeId(null);
            setContextMenu(prev => ({ ...prev, visible: false }));
        }
    };
    
    // Node-specific handler
    const handleNodeMouseDown = (e, nodeId) => {
        if (e.button === 0) {
            e.stopPropagation(); // Stop propagation for left-clicks on nodes
            setDraggedNodeId(nodeId);
            setStartMouse({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            const dx = e.clientX - startMouse.x;
            const dy = e.clientY - startMouse.y;
            setPan(prevPan => ({
                x: prevPan.x + dx,
                y: prevPan.y + dy
            }));
            setStartMouse({ x: e.clientX, y: e.clientY });
        } else if (draggedNodeId) {
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
            setStartMouse({ x: e.clientX, y: e.clientY });
        } else if (tempConnection) {
            setTempConnection(prev => ({
                ...prev,
                x2: e.clientX - pan.x,
                y2: e.clientY - pan.y,
            }));
        }
    };

    const handleMouseUp = (e) => {
        // Finalize connection logic
        if (tempConnection) {
            const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
            const targetNodeElement = elementsUnderCursor.find(el => el.classList.contains('connection-point'));
            
            if(targetNodeElement) {
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
        setDraggedNodeId(null);
    };

    const handleConnectionMouseDown = (e, id) => {
        e.stopPropagation();
        const sourceNode = nodes.find(n => n.id === id);
        setTempConnection({
            sourceId: id,
            x1: sourceNode.x + 60,
            y1: sourceNode.y + 45,
            x2: e.clientX - pan.x,
            y2: e.clientY - pan.y,
        });
    };

    // The onClick handler for the outer div
    const handleOuterDivClick = (e) => {
        // If the click target is NOT a child of a node, a connection point, or the context menu, deselect everything.
        if (!e.target.closest('.flowchart-node') && !e.target.closest('.context-menu')) {
            setSelectedConnectionSource(null);
        }
    };

    return (
        <div
            id="flowchart-canvas-outer-div"
            style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
            onClick={handleOuterDivClick} // Use this for clearing selections
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Good practice to reset state if mouse leaves the canvas
        >
            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    nodeId={contextMenu.nodeId}
                    handleDeleteNode={handleDeleteNode}
                />
            )}
            <div
                id='flowchart-canvas-div'
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'lightgray',
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                    cursor: isPanning ? 'grabbing' : 'grab',
                }}
                tabIndex={0}
            />
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    // dynamically set pointer events
                    pointerEvents: tempConnection ? 'auto' : 'none', 
                }}
                onKeyDown={handleCanvasKeyDown}
            >
                {connections.map(conn => {
                    const sourceNode = nodes.find(n => n.id === conn.source);
                    const targetNode = nodes.find(n => n.id === conn.target);
                    if (sourceNode && targetNode) {
                        return (
                            <Connection
                                key={conn.id}
                                id={conn.id}
                                x1={sourceNode.x + 60 + pan.x}
                                y1={sourceNode.y + 45 + pan.y}
                                x2={targetNode.x + 60 + pan.x}
                                y2={targetNode.y + 45 + pan.y}
                                setConnections={setConnections}
                            />
                        );
                    }
                    return null;
                })}
                { tempConnection && (
                    <line
                        x1 = {tempConnection.x1 + pan.x}
                        y1 = {tempConnection.y1 + pan.y}
                        x2 = {tempConnection.x2}
                        y2 = {tempConnection.y2}
                        stroke="black"
                        strokeWidth="2"
                    />
                )}
            </svg>
            {nodes.map(node => (
                <FlowchartNode
                    key={node.id}
                    id={node.id}
                    x={node.x + pan.x}
                    y={node.y + pan.y}
                    text={node.text}
                    tabIndex={0}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    handleConnectionMouseDown={handleConnectionMouseDown}
                    handleNodeKeyDown={handleNodeKeyDown}
                    isSelected={selectedConnectionSource === node.id}
                    isEditing={editingNodeId === node.id}
                    handleNodeTextChange={handleNodeTextChange}
                    handleDoubleClick={handleDoubleClick}
                    handleBlur={() => setEditingNodeId(null)}
                    handleContextMenu={handleContextMenu}
                />
            ))}
        </div>
    );
};

export default FlowchartCanvas;