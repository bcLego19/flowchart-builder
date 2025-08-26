// FlowchartNode.jsx file
import './FlowchartNode.css';
import React from 'react';

const FlowchartNode = ({id, x, y, text, onMouseDown, handleConnectionMouseDown, handleNodeKeyDown, isSelected, isEditing, handleDoubleClick, handleNodeTextChange,
                        handleBlur, handleContextMenu}) => {
  // use classnames library or a simple template literal
  const nodeClasses = `flowchart-node ${isSelected ? 'selected' : ''}`;

  const handleKeyDown = (e) => {
    // check for shift + f10 key (standard shortcut for context menus)
    if (e.shiftKey && e.key === 'F10') {
      e.preventDefault();

      const nodeRect = e.currentTarget.getBoundingClientRect();
      const x = nodeRect.left + 20;
      const y = nodeRect.top + 20;
      handleContextMenu({clientX: x, clientY: y, preventDefault: () => {} }, id);
    } else {
      handleNodeKeyDown(e,id);
    }
  }

  return (
    <div
      className={nodeClasses}
      tabIndex={0}
      id={id}
      style={{ left: x, top: y }}
      onMouseDown={onMouseDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => handleDoubleClick(id)}
      aria-label={`Flowchart Node: ${text}`}
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
        aria-label={`Connection point: ${text}`}
      />
    </div>
  );
};

export default React.memo(FlowchartNode);