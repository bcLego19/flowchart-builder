// src/App.jsx
import { FlowchartProvider } from './context/FlowchartContext.jsx';
import FlowchartCanvas from '../components/FlowchartCanvas/FlowchartCanvas.jsx';
import Toolbar from '../components/Toolbar/Toolbar.jsx';
import './App.css';

function App() {
    return (
        <FlowchartProvider>
            <div id="app">
                <div className="sidebar">
                    <h1>Flowchart Builder</h1>
                    <Toolbar />
                </div>
                <div className="main-content">
                    <FlowchartCanvas />
                </div>
            </div>
        </FlowchartProvider>
    );
}

export default App;