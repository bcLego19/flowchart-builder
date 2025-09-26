// src/components/FlowchartCanvas/FlowchartCanvas.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';
import Connection from '../Connection/Connection.jsx';
import { useFlowchart } from '../../src/context/FlowchartContext.jsx';

const FlowchartCanvas = () => {
    // Destructure all the necessary state and functions from the context
    const {
        nodes, setNodes, connections, setConnectionsAndSave, mode, setMode, pan, setPan,
        startMouse, setStartMouse, draggedNodeId, setDraggedNodeId,
        dragStartPos, setDragStartPos, selectedConnectionSource, setSelectedConnectionSource,
        selectedConnectionId, setSelectedConnectionId, onDeleteSelected,
        handleNodeMouseDownCallback,
        handleNodeTextChange, handleDoubleClick, handleNodeKeyDownCallback,
        editingNodeId, setEditingNodeId, handleSelectConnection,
        undo, redo, commitNodesForDragging, zoom, handleZoom,
        getCenterCoordinates,
    } = useFlowchart();

    // The temporary connection state is now local to this component
    const [tempConnection, setTempConnection] = useState(null);

    const canvasRef = useRef(null);
    const svgRef = useRef(null);

    const handleCanvasMouseDown = (e) => {
        if (e.target.closest('.flowchart-node') || e.target.closest('line')) {
            return;
        }

        if (e.target.id === 'flowchart-canvas-div') {
            setMode('panning');
            setStartMouse({ x: e.clientX, y: e.clientY });
        }
        
        setSelectedConnectionSource(null);
        setSelectedConnectionId(null);
        setEditingNodeId(null);
    };

    const handleLocalNodeMouseDown = (e, nodeId) => {
        // Let the context handle mode changes and selection
        handleNodeMouseDownCallback(e, nodeId);

        // If in 'connecting' mode, set up the temp connection here
        if (e.shiftKey) {
            const sourceNode = nodes.find(n => n.id === nodeId);
            if (!sourceNode) return;

            const center = getCenterCoordinates(sourceNode);

            setTempConnection({
                sourceId: nodeId,
                x1: center.x,
                y1: center.y,
                x2: center.x, // Set initial endpoint to be the same as the start
                y2: center.y,
            });
        }
    };

    const handleMouseMove = (e) => {
        if (mode === 'panning') {
            const dx = e.clientX - startMouse.x;
            const dy = e.clientY - startMouse.y;
            setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
            setStartMouse({ x: e.clientX, y: e.clientY });
        } else if (mode === 'dragging') {

            const dx = (e.clientX - startMouse.x) / zoom;
            const dy = (e.clientY - startMouse.y) / zoom;

            setNodes(prevNodes => prevNodes.map(node => {
                if (node.id === draggedNodeId) {
                    return { ...node, x: node.x + dx, y: node.y + dy };
                }
                return node;
            }));

            setStartMouse({ x: e.clientX, y: e.clientY });

        } else if (mode === 'connecting' && tempConnection) {
            // Get the bounding rectangle of the SVG to correct the mouse coordinates
            // This is already correct
            const svgElement = svgRef.current;
            if (!svgElement) return;
            const svgRect = svgElement.getBoundingClientRect();

            // Calculate the mouse position relative to the SVG, subtracting the pan
            const adjustedX = ((e.clientX - svgRect.left) - pan.x) / zoom;
            const adjustedY = ((e.clientY - svgRect.top) - pan.y) / zoom;

            setTempConnection(prevTemp => ({
                ...prevTemp,
                x2: adjustedX,
                y2: adjustedY,
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (tempConnection) {
            console.log("handleMouseUp: Temp connection exists");
            const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
            const targetNodeElement = elementsUnderCursor.find(el => el.classList.contains('flowchart-node'));
            
            if(targetNodeElement) {
                console.log("handleMouseUp: target node element exists");
                const targetId = targetNodeElement.id;
                if (targetId && targetId !== tempConnection.sourceId) {
                    console.log("handleMouseUp: target id exists and is strictly equal to the source id of temp connection");
                    const connectionExists = connections.some(
                        conn => (conn.source === tempConnection.sourceId && conn.target === targetId) ||
                                (conn.source === targetId && conn.target === tempConnection.sourceId)
                    );

                    if (!connectionExists) {
                        console.log("handleMouseUp: connection exists is false");
                        const newConnection = {
                            id: `conn-${Date.now()}`,
                            source: tempConnection.sourceId,
                            target: targetId,
                        };
                        setConnectionsAndSave(prev => [...prev, newConnection]);
                    }
                }
            }

        }

        if (mode === 'dragging' && draggedNodeId) {
            console.log("handleMouseUp: dragged node id exists while mode is dragging");
            
            const movedNode = nodes.find(n => n.id === draggedNodeId);
            const hasMoved = movedNode && dragStartPos && (
                Math.abs(movedNode.x - dragStartPos.x) > 1 || 
                Math.abs(movedNode.y - dragStartPos.y) > 1
            );

            if (hasMoved) {
                console.log("handleMouseUp: node has moved");
                commitNodesForDragging();
            }
        }

        setMode('idle');
        setDraggedNodeId(null);
        setTempConnection(null);
    };

    // Use effect to focus the canvas whenever a selection is made
    useEffect(() => {
        if ((selectedConnectionId || selectedConnectionSource) && canvasRef.current) {
            canvasRef.current.focus();
        }
    }, [selectedConnectionId, selectedConnectionSource]);

    // Keyboard event listener to delete selected items
    useEffect(() => {
        const handleKeyDown = (e) => {
            if(e.key === 'Escape') {
                setSelectedConnectionSource(null);
                setSelectedConnectionId(null);
                setEditingNodeId(null);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedConnectionId || selectedConnectionSource)) {
                onDeleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedConnectionId, selectedConnectionSource, onDeleteSelected, setSelectedConnectionId, setSelectedConnectionSource]);

    return (
        <div
            id="flowchart-canvas-outer-div"
            style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                cursor: mode === 'panning' ? 'grabbing' : mode === 'dragging' ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleZoom}
            tabIndex={0}
            aria-label="Flowchart Canvas"
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
            >
                <div
                    id='flowchart-canvas-div'
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'lightgray',
                        cursor: mode === 'panning' ? 'grabbing' : mode === 'dragging' ? 'grabbing' : 'grab',
                    }}
                />
                <svg
                    ref={svgRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: tempConnection ? 'auto' : 'none',
                    }}
                >
                    {connections.map(conn => {
                        const sourceNode = nodes.find(n => n.id === conn.source);
                        const targetNode = nodes.find(n => n.id === conn.target);
                        if (sourceNode && targetNode) {
                            const sourceCenter = getCenterCoordinates(sourceNode);
                            const targetCenter = getCenterCoordinates(targetNode);

                            return (
                                <Connection
                                    key={conn.id}
                                    id={conn.id}
                                    x1={sourceCenter.x}
                                    y1={sourceCenter.y}
                                    x2={targetCenter.x}
                                    y2={targetCenter.y}
                                    onSelectConnection={handleSelectConnection}
                                    isSelected={selectedConnectionId === conn.id}
                                    sourceText={sourceNode.text}
                                    targetText={targetNode.text}
                                />
                            );
                        }
                        return null;
                    })}
                    {tempConnection && (
                        <line
                            x1={tempConnection.x1}
                            y1={tempConnection.y1}
                            x2={tempConnection.x2}
                            y2={tempConnection.y2}
                            stroke="black"
                            strokeWidth="2"
                        />
                    )}
                </svg>
                {nodes.map(node => (
                    <FlowchartNode
                        key={node.id}
                        id={node.id}
                        x={node.x}
                        y={node.y}
                        text={node.text}
                        type={node.type}
                        tabIndex={0}
                        onMouseDown={(e) => handleLocalNodeMouseDown(e, node.id)}
                        handleNodeKeyDown={handleNodeKeyDownCallback}
                        isSelected={selectedConnectionSource === node.id}
                        isEditing={editingNodeId === node.id}
                        handleNodeTextChange={handleNodeTextChange}
                        handleDoubleClick={handleDoubleClick}
                        handleBlur={() => {
                            if (editingNodeId === node.id) {
                                commitNodesForDragging();
                                setEditingNodeId(null);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlowchartCanvas;