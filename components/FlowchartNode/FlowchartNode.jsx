// FlowchartNode.jsx file
import './FlowchartNode.css';
import React from 'react';

const FlowchartNode = ({id, x, y, text, onMouseDown, handleConnectionMouseDown, handleNodeKeyDown, isSelected, isEditing, handleDoubleClick, handleNodeTextChange,
                        handleBlur, handleContextMenu}) => {
  // use classnames library or a simple template literal
  const nodeClasses = `flowchart-node ${isSelected ? 'selected-for-connection' : ''}`;

  return (
    <div
      className={nodeClasses}
      tabIndex={0}
      id={id}
      style={{ left: x, top: y }}
      onMouseDown={onMouseDown}
      onKeyDown={(e) => handleNodeKeyDown(e, id)}
      onDoubleClick={() => handleDoubleClick(id)}
      onContextMenu={(e) => handleContextMenu(e, id)}
    >
      {
        isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => handleNodeTextChange(id, e.target.value)}
            onBlur={handleBlur}
            autoFocus
            />
          ) : (
            <h2>{text}</h2>
          )
      }
      <div
        className="connection-point"
        tabIndex={0}
        onMouseDown={(e) => handleConnectionMouseDown(e, id)}
      />
    </div>
  );
};

export default React.memo(FlowchartNode);