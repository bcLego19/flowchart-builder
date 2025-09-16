// src/components/FlowchartCanvas/FlowchartCanvas.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';
import Connection from '../Connection/Connection.jsx';
import { useFlowchart } from '../../src/context/FlowchartContext.jsx';

const FlowchartCanvas = () => {
    // Destructure all the necessary state and functions from the context
    const {
        nodes, setNodes, connections, setConnections, mode, setMode, pan, setPan,
        startMouse, setStartMouse, draggedNodeId, setDraggedNodeId, selectedConnectionSource, setSelectedConnectionSource,
        selectedConnectionId, setSelectedConnectionId, onDeleteSelected,
        handleNodeMouseDownCallback,
        handleNodeTextChange, handleDoubleClick, handleNodeKeyDownCallback,
        editingNodeId, setEditingNodeId, handleSelectConnection
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

            // Calculate starting coordinates relative to the panned canvas
            // This is the correct coordinate system to match the nodes
            const startX = sourceNode.x + 60;
            const startY = sourceNode.y + 45;

            setTempConnection({
                sourceId: nodeId,
                x1: startX,
                y1: startY,
                x2: startX, // Set initial endpoint to be the same as the start
                y2: startY,
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
            const dx = e.clientX - startMouse.x;
            const dy = e.clientY - startMouse.y;
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
            const adjustedX = (e.clientX - svgRect.left) - pan.x;
            const adjustedY = (e.clientY - svgRect.top) - pan.y;

            setTempConnection(prevTemp => ({
                ...prevTemp,
                x2: adjustedX,
                y2: adjustedY,
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (tempConnection) {
            const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
            const targetNodeElement = elementsUnderCursor.find(el => el.classList.contains('flowchart-node'));
            
            if(targetNodeElement) {
                const targetId = targetNodeElement.id;
                if (targetId && targetId !== tempConnection.sourceId) {
                    const connectionExists = connections.some(
                        conn => (conn.source === tempConnection.sourceId && conn.target === targetId) ||
                                (conn.source === targetId && conn.target === tempConnection.sourceId)
                    );

                    if (!connectionExists) {
                        const newConnection = {
                            id: `conn-${Date.now()}`,
                            source: tempConnection.sourceId,
                            target: targetId,
                        };
                        setConnections(prev => [...prev, newConnection]);
                    }
                }
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
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
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
                            return (
                                <Connection
                                    key={conn.id}
                                    id={conn.id}
                                    x1={sourceNode.x + 60}
                                    y1={sourceNode.y + 45}
                                    x2={targetNode.x + 60}
                                    y2={targetNode.y + 45}
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
                        tabIndex={0}
                        onMouseDown={(e) => handleLocalNodeMouseDown(e, node.id)}
                        handleNodeKeyDown={handleNodeKeyDownCallback}
                        isSelected={selectedConnectionSource === node.id}
                        isEditing={editingNodeId === node.id}
                        handleNodeTextChange={handleNodeTextChange}
                        handleDoubleClick={handleDoubleClick}
                        handleBlur={() => setEditingNodeId(null)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlowchartCanvas;