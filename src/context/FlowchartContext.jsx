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
    const [tempConnection, setTempConnection] = useState(null);
    const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

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

    const handleNodeTextChange = useCallback((id, newText) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    }, [setNodes]);

    const handleDoubleClick = useCallback((nodeId) => {
        setEditingNodeId(nodeId);
    }, []);

    const handleNodeKeyDownCallback = useCallback((e, id) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSelectedConnectionId(null);

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
        }
    }, [selectedConnectionSource, setSelectedConnectionSource, setSelectedConnectionId, setConnections, connections]);

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
        pan, setPan, startMouse, setStartMouse, draggedNodeId, setDraggedNodeId,
        tempConnection, setTempConnection, selectedConnectionSource, setSelectedConnectionSource,
        selectedConnectionId, setSelectedConnectionId, createNode, handleDeleteSelection,
        handleNodeMouseDownCallback, handleConnectionMouseDownCallback,
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