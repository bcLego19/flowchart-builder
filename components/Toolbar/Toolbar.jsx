// components/Toolbar/Toolbar.jsx
import './Toolbar.css';

// The toolbar component, which accepts a createNode property
const Toolbar = ({createNode, onDeleteSelected}) => {
  return (
    <div>
      <h2 className="toolbar">Toolbar</h2>
      <div className="toolbar-content">
        <button className="toolbar-btn" onClick={createNode}>Add</button>
        <button className="toolbar-btn" onClick={onDeleteSelected}>Delete Selected</button>
      </div>
    </div>
  );
};

export default Toolbar;