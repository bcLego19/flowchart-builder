// src/components/Toolbar/Toolbar.jsx
import './Toolbar.css';
import { useFlowchart } from '../../src/context/FlowchartContext.jsx';

const Toolbar = () => {
  const { createNode, handleDeleteSelection, undo, redo, canUndo, canRedo } = useFlowchart();

  return (
    <div>
      <h2 className="toolbar-header">Toolbar</h2>
      <div className="toolbar-content">
        {/* Existing Buttons */}
        <button className="toolbar-btn" onClick={createNode} aria-label="Add new node">Add</button>
        <button className="toolbar-btn" onClick={handleDeleteSelection} aria-label="Delete selected node or connection">Delete Selected</button>

        {/* New Undo/Redo Buttons */}
        <button className="toolbar-btn" onClick={undo} disabled={!canUndo} aria-label="Undo last action">Undo</button>
        <button className="toolbar-btn" onClick={redo} disabled={!canRedo} aria-label="Redo last undone action">Redo</button>
      </div>
    </div>
  );
};

export default Toolbar;