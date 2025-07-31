import FlowchartCanvas from '../components/FlowchartCanvas';
import Toolbar from '../components/Toolbar';
import './App.css'; // Don't forget to import your CSS!

function App() {
  return (
    // All JSX elements must be wrapped in a single parent element.
    <> 
      <h1>Flowchart Builder</h1>
      <div id="app">
        <Toolbar />
        <FlowchartCanvas />
      </div>
    </>
  );
}

export default App;