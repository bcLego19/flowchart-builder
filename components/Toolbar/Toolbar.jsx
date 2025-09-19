// src/components/Toolbar/Toolbar.jsx
import './Toolbar.css';
import { useFlowchart } from '../../src/context/FlowchartContext.jsx';
import { useRef } from 'react';

const Toolbar = () => {
  const { createNode, handleDeleteSelection, undo, redo, canUndo, canRedo, exportData, importData } = useFlowchart();
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
      // 1. Run the import logic from context
      importData(event); 
      
      // 2. Clear the file input value to allow re-importing the same file
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

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

        {/* Export Button */}
        <button className="toolbar-btn" onClick={exportData}>Export JSON</button>

        {/* Import Button (Triggers the hidden input) */}
        <button className="toolbar-btn" onClick={handleImportClick}>Import JSON</button>

        {/* Hidden File Input */}
        <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
        />

      </div>
    </div>
  );
};

export default Toolbar;