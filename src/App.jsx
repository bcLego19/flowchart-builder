// src/App.jsx
import {useState, useCallback} from 'react';
import FlowchartCanvas from '../components/FlowchartCanvas/FlowchartCanvas.jsx';
import Toolbar from '../components/Toolbar/Toolbar.jsx';
import './App.css';

function App() {
    const [nodes, setNodes] = useState([
        {id: 'start-node', x: 200, y: 150, text: 'Start'}
    ])
    const [connections, setConnections] = useState([]);
    const [mode, setMode] = useState('idle');
    const [pan, setPan] = useState({x: 0, y: 0});
    const [startMouse, setStartMouse] = useState(null);
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [tempConnection, setTempConnection] = useState(null);
    const [selectedConnectionSource, setSelectedConnectionSource] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

    const createNode = () => {
        const newNode = {
            id: `node-${Date.now()}`,
            x: 100 + (20 * nodes.length),
            y: 50 + (20 * nodes.length),
            text: 'New Node',
        };
        setNodes(prevNodes => [...prevNodes, newNode]);
    }

    const handleDeleteNode = useCallback((nodeId) => {
        setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
        setConnections(prevConnections =>
            prevConnections.filter(conn =>
                conn.source !== nodeId && conn.target !== nodeId
            )
        );
        setSelectedConnectionSource(null);
        setSelectedConnectionId(null);
    }, [setNodes, setConnections]);

    const handleDeleteSelection = useCallback(() => {
        if (selectedConnectionId) {
            setConnections(prev => prev.filter(conn => conn.id !== selectedConnectionId));
            setSelectedConnectionId(null);
        } else if (selectedConnectionSource) {
            handleDeleteNode(selectedConnectionSource);
        }
    }, [selectedConnectionId, selectedConnectionSource, setConnections, handleDeleteNode]);

    return (
        <>
            <div id="app">
                <div className="sidebar">
                    <h1>Flowchart Builder</h1>
                    <Toolbar createNode={createNode} onDeleteSelected={handleDeleteSelection}/>
                </div>
                <FlowchartCanvas
                    nodes={nodes}
                    setNodes={setNodes}
                    connections={connections}
                    setConnections={setConnections}
                    mode={mode}
                    setMode={setMode}
                    pan={pan}
                    setPan={setPan}
                    startMouse={startMouse}
                    setStartMouse={setStartMouse}
                    draggedNodeId={draggedNodeId}
                    setDraggedNodeId={setDraggedNodeId}
                    tempConnection={tempConnection}
                    setTempConnection={setTempConnection}
                    selectedConnectionSource={selectedConnectionSource}
                    setSelectedConnectionSource={setSelectedConnectionSource}
                    selectedConnectionId={selectedConnectionId}
                    setSelectedConnectionId={setSelectedConnectionId}
                />
            </div>
        </>
    );
}

export default App;