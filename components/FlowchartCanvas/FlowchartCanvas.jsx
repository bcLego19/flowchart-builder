import { useState, useCallback, useRef, useEffect } from 'react';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';
import Connection from '../Connection/Connection.jsx';
import ContextMenu from '../ContextMenu/ContextMenu.jsx';

const FlowchartCanvas = ({ 
    nodes, setNodes, connections, setConnections, 
    mode, setMode, pan, setPan, startMouse, setStartMouse, 
    draggedNodeId, setDraggedNodeId, tempConnection, setTempConnection,
    selectedConnectionSource, setSelectedConnectionSource,
    selectedConnectionId, setSelectedConnectionId,
    onDeleteSelected,
}) => {
    // These states are specific to the FlowchartCanvas component's local UI
    const [editingNodeId, setEditingNodeId] = useState(null);
    
    // This handler will now be called from the Connection component
    const handleSelectConnection = useCallback((id) => {
        setSelectedConnectionId(id);
        setSelectedConnectionSource(null); // Deselect any node
    }, [setSelectedConnectionId, setSelectedConnectionSource]);

    const handleNodeMouseDownCallback = useCallback((e, nodeId) => {
        if (e.button === 0) {
            e.stopPropagation();
            setMode('dragging');
            setDraggedNodeId(nodeId);
            setStartMouse({ x: e.clientX, y: e.clientY });
            setSelectedConnectionSource(nodeId);
            setSelectedConnectionId(null);
        }
    }, [setMode, setDraggedNodeId, setStartMouse, setSelectedConnectionSource, setSelectedConnectionId]);

    const handleConnectionMouseDownCallback = useCallback((e, id) => {
        e.stopPropagation();
        const sourceNode = nodes.find(n => n.id === id);
        if (!sourceNode) return;
        setMode('connecting');
        setTempConnection({
            sourceId: id,
            x1: sourceNode.x + 60,
            y1: sourceNode.y + 45,
            x2: e.clientX - pan.x,
            y2: e.clientY - pan.y,
        });
        setSelectedConnectionSource(id);
        setSelectedConnectionId(null);
    }, [nodes, pan.x, pan.y, setMode, setTempConnection, setSelectedConnectionSource, setSelectedConnectionId]);

    const handleCanvasMouseDown = (e) => {
        // This handler now correctly deselects everything when the empty canvas is clicked.
        // The checks for '.flowchart-node' and 'line' prevent it from clearing the selection when you click on a node or connection.
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
            setTempConnection(prevTemp => ({
                ...prevTemp,
                x2: e.clientX - pan.x,
                y2: e.clientY - pan.y,
            }));
        }
    };

    const handleMouseUp = (e) => {
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
                    setConnections(prev => [...prev, newConnection]);
                }
            }
        }
        setMode('idle');
        setDraggedNodeId(null);
        setTempConnection(null);
    };

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
    
    // Handlers for node and context menu
    const handleNodeTextChange = useCallback((id, newText) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    }, [setNodes]);

    const handleDoubleClick = useCallback((nodeId) => {
        setEditingNodeId(nodeId);
    }, []);

    // These handlers are now simplified and use the props passed from App
    const handleNodeKeyDownCallback = useCallback((e, id) => {
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
    }, [selectedConnectionSource, setSelectedConnectionSource, setConnections]);

    return (
        <div
            id="flowchart-canvas-outer-div"
            style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            tabIndex={0}
        >
            <div
                id='flowchart-canvas-div'
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'lightgray',
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                    cursor: mode === 'panning' ? 'grabbing' : 'grab',
                }}
            />
            <svg
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
                                x1={sourceNode.x + 60 + pan.x}
                                y1={sourceNode.y + 45 + pan.y}
                                x2={targetNode.x + 60 + pan.x}
                                y2={targetNode.y + 45 + pan.y}
                                onSelectConnection={handleSelectConnection}
                                isSelected={selectedConnectionId === conn.id}
                            />
                        );
                    }
                    return null;
                })}
                { tempConnection && (
                    <line
                        x1={tempConnection.x1 + pan.x}
                        y1={tempConnection.y1 + pan.y}
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
                    x={node.x + pan.x}
                    y={node.y + pan.y}
                    text={node.text}
                    tabIndex={0}
                    onMouseDown={(e) => handleNodeMouseDownCallback(e, node.id)}
                    handleConnectionMouseDown={handleConnectionMouseDownCallback}
                    handleNodeKeyDown={handleNodeKeyDownCallback}
                    isSelected={selectedConnectionSource === node.id}
                    isEditing={editingNodeId === node.id}
                    handleNodeTextChange={handleNodeTextChange}
                    handleDoubleClick={handleDoubleClick}
                    handleBlur={() => setEditingNodeId(null)}
                />
            ))}
        </div>
    );
};

export default FlowchartCanvas;