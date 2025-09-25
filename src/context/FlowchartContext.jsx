// src/context/FlowchartContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';

// create the context
const FlowchartContext = createContext();

// create a custom hook to use the context
export const useFlowchart = () => {
	return useContext(FlowchartContext);
};

export const NODE_TYPES = {
    PROCESS: 'process',
    DECISION: 'decision',
    START_END: 'start_end',
}

export const FlowchartProvider = ({ children }) => {
    // Add the editingNodeId state to the context
    const [editingNodeId, setEditingNodeId] = useState(null);

    const [nodes, setNodes] = useState([
        { id: 'start-node', x: 200, y: 150, text: 'Start', type: NODE_TYPES.START_END }
    ]);
    const [connections, setConnections] = useState([]);
    const [mode, setMode] = useState('idle');
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [startMouse, setStartMouse] = useState(null);
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [dragStartPos, setDragStartPos] = useState(null);
    const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

    const [history, setHistory] = useState([{ nodes, connections }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const MOVE_STEP = 10;

    const getNodes = useCallback(() => nodes, [nodes]);

    const saveHistory = useCallback((newNodes, newConnections) => {
        // Correctly cut off 'redo' states
        const newHistory = history.slice(0, historyIndex + 1);
        
        // Add the new state
        const updatedHistory = [...newHistory, { nodes: newNodes, connections: newConnections }];
        setHistory(updatedHistory);
        
        // Set index to the last element of the newly created array
        setHistoryIndex(updatedHistory.length - 1);
    }, [history, historyIndex]);

    // const setNodesAndSave = useCallback((newNodes) => {
    //     setNodes(newNodes);
    //     saveHistory(newNodes, connections);
    // }, [connections, saveHistory]);

    // New helper to get the current state of connections for a functional update
    // This is only necessary because React state updates are batched and asynchronous.
    const getConnections = useCallback(() => connections, [connections]); 

    // RE-WRITE commitNodesAndHistory
    const commitNodesAndHistory = useCallback((nodesUpdate) => {
        setNodes(prevNodes => {
            const newNodes = typeof nodesUpdate === 'function' ? nodesUpdate(prevNodes) : nodesUpdate;

            // We still have to use the connections state from the closure here,
            // which is fine for node-only changes, but let's make it explicit.
            saveHistory(newNodes, getConnections()); // Call the getter

            return newNodes;
        });
    }, [getConnections, saveHistory]);

    const setConnectionsAndSave = useCallback((newConnectionsUpdate) => {
        setConnections(prevConnections => {
            // 1. Calculate the new connections list
            const newConnections = typeof newConnectionsUpdate === 'function' 
                ? newConnectionsUpdate(prevConnections) 
                : newConnectionsUpdate;

            // 2. Save the history *synchronously* using the getter for nodes.
            saveHistory(getNodes(), newConnections);
            
            // 3. Return the new state for React to process
            return newConnections;
        });
    }, [getNodes, saveHistory]);

    const createNode = useCallback((type = NODE_TYPES.PROCESS) => {
        const newNode = {
            id: `node-${Date.now()}`,
            x: 100 + (20 * nodes.length),
            y: 50 + (20 * nodes.length),
            text: type === NODE_TYPES.DECISION ? 'Decision?' : 'New Step',
            type: type,
        };
        commitNodesAndHistory(prevNodes => [...prevNodes, newNode]);
    }, [nodes.length, commitNodesAndHistory]);

    const handleSelectConnection = useCallback((id) => {
        if (selectedConnectionId === id) {
            setSelectedConnectionId(null);
        } else {
            setSelectedConnectionId(id);
        }
        setSelectedConnectionSource(null);
    }, [selectedConnectionId]);

    const handleDeleteNode = useCallback((nodeId) => {
        // 1. Calculate the new state for nodes and connections first
        const newNodes = nodes.filter(node => node.id !== nodeId);
        const newConnections = connections.filter(conn =>
            conn.source !== nodeId && conn.target !== nodeId
        );

        // 2. Commit the combined state to history ONCE (This is synchronous)
        saveHistory(newNodes, newConnections);
        
        // 3. Update the state with the new values *immediately* after saving the history.
        //    These calls will be batched by React but the history state is already saved.
        setNodes(newNodes);
        setConnections(newConnections);

        setSelectedConnectionSource(null);
        setSelectedConnectionId(null);

    }, [nodes, connections, saveHistory, setNodes, setConnections]);

    const handleDeleteSelection = useCallback(() => {
        if (selectedConnectionId) {
            // Passes a functional update: (prev => prev.filter(...))
            setConnectionsAndSave(prev => prev.filter(conn => conn.id !== selectedConnectionId)); 
            setSelectedConnectionId(null);
        } else if (selectedConnectionSource) {
            handleDeleteNode(selectedConnectionSource);
        }
    }, [selectedConnectionId, selectedConnectionSource, setConnectionsAndSave, handleDeleteNode]);

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

            const nodeToDrag = nodes.find(n => n.id === nodeId);
            if (nodeToDrag) {
                setDragStartPos({ x: nodeToDrag.x, y: nodeToDrag.y });
            }
        }
    }, [setMode, setDraggedNodeId, setStartMouse, setSelectedConnectionSource, setSelectedConnectionId, nodes]);

    const handleNodeTextChange = useCallback((id, newText) => {
        commitNodesAndHistory(prevNodes => prevNodes.map(node =>
            node.id === id ? {...node, text: newText} : node
        ));
    }, [commitNodesAndHistory]);

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
                        setConnectionsAndSave(prev => [...prev, newConnection]);
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
            commitNodesAndHistory(prevNodes => prevNodes.map(node =>
                node.id === id ? { ...node, x: newX, y: newY } : node
            ));
        }
    }, [nodes, selectedConnectionSource, connections, commitNodesAndHistory, setConnectionsAndSave]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const { nodes: prevNodes, connections: prevConnections } = history[newIndex];
            setNodes(prevNodes);
            setConnections(prevConnections);
            setHistoryIndex(newIndex);

            setSelectedConnectionId(null);
            setSelectedConnectionSource(null);
            setEditingNodeId(null);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const { nodes: nextNodes, connections: nextConnections } = history[newIndex];
            setNodes(nextNodes);
            setConnections(nextConnections);
            setHistoryIndex(newIndex);

            setSelectedConnectionId(null);
            setSelectedConnectionSource(null);
            setEditingNodeId(null);
        }
    }, [history, historyIndex]);

    // New function to commit the current, raw node state to history
    const commitNodesForDragging = useCallback(() => {
        saveHistory(nodes, connections);
    }, [nodes, connections, saveHistory]);

    // A new, simpler setNodes that just updates state, without saving history (for dragging intermediates)
    const setNodesWithoutSave = setNodes; // Just a rename for clarity

    const exportData = useCallback(() => {
        // 1. create data object
        const data = {
            nodes: nodes,
            connections: connections,
            // include a version for future compatability checks
            version: "1.0.0",
        };

        // 2. Convert object to json string
        const jsonString = JSON.stringify(data, null, 2);

        // 3. Create a blob and download link
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        // 4. Trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowchart-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();

        // 5. Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [nodes, connections]);

    const importData = useCallback((event) => {
        console.log('importData: get file');
        const file = event.target.files[0];
        console.log(`importData: ${ !file ? `file does not exist` : `file exists`}.`);
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (importedData.nodes && importedData.connections) {
                    setNodes(importedData.nodes);
                    setConnections(importedData.connections);

                    saveHistory(importedData.nodes, importedData.connections);

                    setSelectedConnectionId(null);
                    setSelectedConnectionSource(null);
                    setEditingNodeId(null);

                    console.log('Flowchart imported successfully!');
                } else {
                    console.error('Invalid file format: missing nodes or connections.');
                }
            } catch (error) {
                console.error('Error parsing JSON file:', error);
            }
        }

        reader.readAsText(file);
    }, [setNodes, setConnections, saveHistory, setSelectedConnectionId, setSelectedConnectionSource, setEditingNodeId]);

    // All the state and functions you want to share
    const value = {
        nodes,  
        connections, 
        setConnections: setConnections, 
        mode, 
        setMode, 
        pan, 
        setPan, 
        startMouse, 
        setStartMouse, 
        draggedNodeId, 
        setDraggedNodeId,
        dragStartPos,
        setDragStartPos, 
        selectedConnectionSource, 
        setSelectedConnectionSource,
        selectedConnectionId, 
        setSelectedConnectionId, 
        createNode, 
        handleDeleteSelection,
        handleNodeMouseDownCallback,
        handleNodeTextChange, 
        handleDoubleClick, 
        handleNodeKeyDownCallback,
        createNode, 
        handleDeleteSelection, 
        setEditingNodeId, 
        editingNodeId, 
        setEditingNodeId,
        handleSelectConnection, 
        onDeleteSelected: handleDeleteSelection,
        setNodes: setNodesWithoutSave,
        // setNodesAndSave,
        setConnectionsAndSave,
        commitNodesAndHistory,
        commitNodesForDragging,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        exportData,
        importData,
    };

    return (
        <FlowchartContext.Provider value={value}>
            {children}
        </FlowchartContext.Provider>
    );
}