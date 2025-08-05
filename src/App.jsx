// src/App.jsx

import {useState} from 'react';
import FlowchartCanvas from '../components/FlowchartCanvas/FlowchartCanvas.jsx';
import Toolbar from '../components/Toolbar/Toolbar.jsx';
import './App.css'; // Don't forget to import your CSS!

function App() {
  // New state to hold array of nodes
  const [nodes, setNodes] = useState([
    {id: 'start-node', x: 200, y: 150, text: 'Start'}
  ])

  // handler for creating a new node
  const createNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      x: 400, // default position
      y: 200,
      text: 'New Node',
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  }

  return (
    // All JSX elements must be wrapped in a single parent element.
    <> 
      <h1>Flowchart Builder</h1>
      <div id="app">
        <Toolbar />
        <FlowchartCanvas nodes={nodes} setNodes={setNodes}/>
      </div>
    </>
  );
}

export default App;