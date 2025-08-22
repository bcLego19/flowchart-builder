// src/components/FlowchartCanvas.jsx
import { useReducer, useState, useCallback, useRef, useEffect } from 'react';
import { flowchartReducer, initialState } from '../../src/hooks/useFlowchartReducer.jsx';
import FlowchartNode from '../FlowchartNode/FlowchartNode.jsx';
import Connection from '../Connection/Connection.jsx';
import ContextMenu from '../ContextMenu/ContextMenu.jsx';

const FlowchartCanvas = ({ nodes, setNodes, connections, setConnections }) => {
    const [state, dispatch] = useReducer(flowchartReducer, initialState);
    const { mode, pan, startMouse, draggedNodeId, tempConnection, selectedConnectionSource, selectedConnectionId } = state;
    const isPanning = mode === 'panning';

    const [editingNodeId, setEditingNodeId] = useState(null);
    const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, nodeId: null});

    const handleDeleteNode = useCallback((nodeId) => {
        setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
        setConnections(prevConnections =>
            prevConnections.filter(conn =>
                conn.source !== nodeId && conn.target !== nodeId
            )
        );
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
    }, [setNodes, setConnections]);

    const handleDeleteSelection = useCallback(() => {
        if (selectedConnectionId) {
            setConnections(prev => prev.filter(conn => conn.id !== selectedConnectionId));
            dispatch({ type: 'CLEAR_SELECTION'});
        } else if (selectedConnectionSource) {
            handleDeleteNode(selectedConnectionSource);
            dispatch({ type: 'CLEAR_SELECTION'});
        }
    }, [selectedConnectionId, selectedConnectionSource, setConnections, handleDeleteNode, dispatch]);

    // Make sure this handler is defined AFTER handleDeleteSelection
    // And simplify its dependency.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if(e.key === 'Escape') {
                dispatch({ type: 'CLEAR_SELECTION' });
                setEditingNodeId(null);
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                handleDeleteSelection();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDeleteSelection, dispatch]);

    const handleContextMenu = useCallback((e, nodeId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            nodeId: nodeId,
        });
    }, []);

    const handleNodeTextChange = useCallback((id, newText) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    }, [setNodes]);

    const handleDoubleClick = useCallback((nodeId) => {
        setEditingNodeId(nodeId);
    }, []);
    
    // This handler is for the main canvas, so it doesn't need to be in useCallback.
    const handleCanvasKeyDown = useCallback((e) => {
        if(e.key === 'Escape') {
            dispatch({ type: 'CLEAR_SELECTION' });
            setEditingNodeId(null);
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            handleDeleteSelected();
        }
    }, [handleDeleteSelection, dispatch]);
    
    // Correctly wrap the handlers that will be passed to the memoized FlowchartNode
    const handleNodeKeyDownCallback = useCallback((e, id) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            if(selectedConnectionSource === id) {
                dispatch({ type: 'CLEAR_SELECTION' });
            } else if (selectedConnectionSource) {
                const newConnection = {
                    id: `conn-${Date.now()}`,
                    source: selectedConnectionSource,
                    target: id,
                };
                setConnections(prev => [...prev, newConnection]);
                dispatch({ type: 'CLEAR_SELECTION' });
            } else {
                dispatch({ type: 'SELECT_NODE', payload: { nodeId: id } });
            }
        }
    }, [dispatch, selectedConnectionSource, setConnections]);

    const handleNodeMouseDownCallback = useCallback((e, nodeId) => {
        if (e.button === 0) {
            e.stopPropagation();
            dispatch({ type: 'DRAG_START', payload: { draggedNodeId: nodeId, startMouse: { x: e.clientX, y: e.clientY } } });
        }
    }, [dispatch]);

    // handleConnectionMouseDown is also passed to FlowchartNode
    const handleConnectionMouseDownCallback = useCallback((e, id) => {
        e.stopPropagation();
        const sourceNode = nodes.find(n => n.id === id);
        const tempConnectionData = {
            sourceId: id,
            x1: sourceNode.x + 60,
            y1: sourceNode.y + 45,
            x2: e.clientX - pan.x,
            y2: e.clientY - pan.y,
        };
        dispatch({ type: 'CONNECT_START', payload: { tempConnection: tempConnectionData, sourceId: id } });
    }, [dispatch, nodes, pan.x, pan.y]);

    const handleMouseMove = (e) => {
        if (mode === 'panning') {
            const dx = e.clientX - state.startMouse.x;
            const dy = e.clientY - state.startMouse.y;
            dispatch({ type: 'PAN_MOVE', payload: { pan: { x: state.pan.x + dx, y: state.pan.y + dy }, startMouse: { x: e.clientX, y: e.clientY } } });
        } else if (mode === 'dragging') {
            const dx = e.clientX - state.startMouse.x;
            const dy = e.clientY - state.startMouse.y;
            setNodes(prevNodes => prevNodes.map(node => {
                if (node.id === state.draggedNodeId) {
                    return { ...node, x: node.x + dx, y: node.y + dy };
                }
                return node;
            }));
            dispatch({ type: 'DRAG_MOVE', payload: { startMouse: { x: e.clientX, y: e.clientY } } });
        } else if (mode === 'connecting') {
            dispatch({ type: 'CONNECT_MOVE', payload: { tempConnection: { ...state.tempConnection, x2: e.clientX - state.pan.x, y2: e.clientY - state.pan.y } } });
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
        dispatch({ type: 'END_INTERACTION' });
    };

    const handleMouseDown = (e) => {
        if (e.button === 0) {
            // prevent clearing selection if node or connection is clicked
            // console.log(`target tag name: ${e.target.tagName}`);
            if (e.target.closest('.flowchart-node') || e.target.tagName === 'line') {
                // console.log('returning early from mouse down');
                return;
            }

            if (e.target.id === 'flowchart-canvas-div') {
                dispatch({ type: 'PAN_START', payload: { startMouse: { x: e.clientX, y: e.clientY } } });
            }

            dispatch({ type: 'CLEAR_SELECTION' });
            setEditingNodeId(null);
            setContextMenu(prev => ({ ...prev, visible: false }));
        }
    };

    const handleOuterDivClick = (e) => {
        if (!e.target.closest('.flowchart-node') && !e.target.closest('.context-menu') && !e.target.closest('line')) {
            dispatch({ type: 'CLEAR_SELECTION' });
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
            onClick={handleOuterDivClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onKeyDown={handleCanvasKeyDown}
            tabIndex={0}
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
                                setConnections={setConnections}
                                onSelectConnection={() => handleSelectConnection(conn.id)}
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
                    handleBlur={() => setEditingNodeId(null)} // <-- This can also be wrapped
                    handleContextMenu={handleContextMenu}
                />
            ))}
        </div>
    );
};

export default FlowchartCanvas;