// components/Toolbar/Toolbar.jsx
import './Toolbar.css';

const Toolbar = ({ createNode, onDeleteSelected }) => {
  return (
    <div>
      <h2 className="toolbar-header">Toolbar</h2>
      <div className="toolbar-content">
        <button className="toolbar-btn" onClick={createNode}>Add</button>
        <button className="toolbar-btn" onClick={onDeleteSelected}>Delete Selected</button>
      </div>
    </div>
  );
};

export default Toolbar;