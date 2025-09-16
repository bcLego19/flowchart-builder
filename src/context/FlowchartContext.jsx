// src/context/FlowchartContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';

// create the context
const FlowchartContext = createContext();

// create a custom hook to use the context
export const useFlowchart = () => {
	return useContext(FlowchartContext);
};

export const FlowchartProvider = ({ children }) => {
    // Add the editingNodeId state to the context
    const [editingNodeId, setEditingNodeId] = useState(null);

    const [nodes, setNodes] = useState([
        { id: 'start-node', x: 200, y: 150, text: 'Start' }
    ]);
    const [connections, setConnections] = useState([]);
    const [mode, setMode] = useState('idle');
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [startMouse, setStartMouse] = useState(null);
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

    const MOVE_STEP = 10;

    const createNode = useCallback(() => {
        const newNode = {
            id: `node-${Date.now()}`,
            x: 100 + (20 * nodes.length),
            y: 50 + (20 * nodes.length),
            text: 'New Node',
        };
        setNodes(prevNodes => [...prevNodes, newNode]);
    }, [nodes.length]);

    const handleSelectConnection = useCallback((id) => {
        if (selectedConnectionId === id) {
            setSelectedConnectionId(null);
        } else {
            setSelectedConnectionId(id);
        }
        setSelectedConnectionSource(null);
    }, [selectedConnectionId, setSelectedConnectionId, setSelectedConnectionSource]);

    const handleDeleteNode = useCallback((nodeId) => {
        setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
        setConnections(prevConnections =>
            prevConnections.filter(conn =>
                conn.source !== nodeId && conn.target !== nodeId
            )
        );
        setSelectedConnectionSource(null);
        setSelectedConnectionId(null);
    }, []);

    const handleDeleteSelection = useCallback(() => {
        if (selectedConnectionId) {
            setConnections(prev => prev.filter(conn => conn.id !== selectedConnectionId));
            setSelectedConnectionId(null);
        } else if (selectedConnectionSource) {
            handleDeleteNode(selectedConnectionSource);
        }
    }, [selectedConnectionId, selectedConnectionSource, handleDeleteNode]);

    const handleNodeMouseDownCallback = useCallback((e, nodeId) => {
        e.stopPropagation();
        setSelectedConnectionId(null); // Deselect any connection

        if (e.shiftKey) {
            setSelectedConnectionSource(nodeId);
            setMode('connecting');
        } else if (e.button === 0) { // Left-click
            setMode('dragging');
            setDraggedNodeId(nodeId);
            setStartMouse({ x: e.clientX, y: e.clientY });
            setSelectedConnectionSource(nodeId);
        }
    }, [setMode, setDraggedNodeId, setStartMouse, setSelectedConnectionSource, setSelectedConnectionId]);

    const handleNodeTextChange = useCallback((id, newText) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    }, [setNodes]);

    const handleDoubleClick = useCallback((nodeId) => {
        setEditingNodeId(nodeId);
    }, []);

    const handleNodeKeyDownCallback = useCallback((e, id) => {
        // Prevent the default browser behavior (e.g., scrolling with arrow keys)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }

        // Get the node we're currently on
        const currentNode = nodes.find(n => n.id === id);
        if (!currentNode) return;

        let newX = currentNode.x;
        let newY = currentNode.y;

        switch (e.key) {
            case 'ArrowUp':
                newY -= MOVE_STEP;
                break;
            case 'ArrowDown':
                newY += MOVE_STEP;
                break;
            case 'ArrowLeft':
                newX -= MOVE_STEP;
                break;
            case 'ArrowRight':
                newX += MOVE_STEP;
                break;
            case 'Enter':
                // Existing logic for making connections with Enter
                if (selectedConnectionSource && selectedConnectionSource !== id) {
                    const connectionExists = connections.some(
                        conn => (conn.source === selectedConnectionSource && conn.target === id) ||
                            (conn.source === id && conn.target === selectedConnectionSource)
                    );
                    if (!connectionExists) {
                        const newConnection = {
                            id: `conn-${Date.now()}`,
                            source: selectedConnectionSource,
                            target: id,
                        };
                        setConnections(prev => [...prev, newConnection]);
                    }
                    setSelectedConnectionSource(null);
                } else {
                    if (selectedConnectionSource === id) {
                        setSelectedConnectionSource(null);
                    } else {
                        setSelectedConnectionSource(id);
                    }
                }
                break;
            default:
                return; // Do nothing for other keys
        }

        // Update the node's position if an arrow key was pressed
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            setNodes(prevNodes => prevNodes.map(node =>
                node.id === id ? { ...node, x: newX, y: newY } : node
            ));
        }
    }, [nodes, selectedConnectionSource, connections, setNodes, setConnections, setSelectedConnectionSource]);

    const onDeleteSelected = useCallback(() => {
        if (selectedConnectionId) {
            setConnections(prev => prev.filter(conn => conn.id !== selectedConnectionId));
            setSelectedConnectionId(null);
        } else if (selectedConnectionSource) {
            handleDeleteNode(selectedConnectionSource);
        }
    }, [selectedConnectionId, selectedConnectionSource, handleDeleteNode]);

    // All the state and functions you want to share
    const value = {
        nodes, setNodes, connections, setConnections, mode, setMode,
        pan, setPan, startMouse, setStartMouse, draggedNodeId, setDraggedNodeId, selectedConnectionSource, setSelectedConnectionSource,
        selectedConnectionId, setSelectedConnectionId, createNode, handleDeleteSelection,
        handleNodeMouseDownCallback,
        handleNodeTextChange, handleDoubleClick, handleNodeKeyDownCallback,
        createNode, handleDeleteSelection, setEditingNodeId, editingNodeId, setEditingNodeId,
        handleSelectConnection, onDeleteSelected
    };

    return (
        <FlowchartContext.Provider value={value}>
            {children}
        </FlowchartContext.Provider>
    );
}