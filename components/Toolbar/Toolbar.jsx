// src/components/Toolbar/Toolbar.jsx
import './Toolbar.css';
import { useFlowchart } from '../../src/context/FlowchartContext.jsx';

const Toolbar = () => {
  const { createNode, handleDeleteSelection } = useFlowchart();

  return (
    <div>
      <h2 className="toolbar-header">Toolbar</h2>
      <div className="toolbar-content">
        <button className="toolbar-btn" onClick={createNode} aria-label="Add new node">Add</button>
        <button className="toolbar-btn" onClick={handleDeleteSelection} aria-label="Delete selected node or connection">Delete Selected</button>
      </div>
    </div>
  );
};

export default Toolbar;