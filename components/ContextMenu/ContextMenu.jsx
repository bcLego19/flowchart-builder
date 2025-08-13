// components/ContextMenu/ContextMenu.jsx
import React from 'react';

const ContextMenu = ({ x, y, nodeId, handleDeleteNode }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    handleDeleteNode(nodeId); // Just call the function with the nodeId
    console.log(nodeId);
  };

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x, zIndex: 1000 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button onClick={handleClick}>
        Delete Node
      </button>
    </div>
  );
};

export default ContextMenu;