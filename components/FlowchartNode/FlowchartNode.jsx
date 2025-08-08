
import './FlowchartNode.css';

const FlowchartNode = ({id, x, y, text, onMouseDown, handleConnectionMouseDown, handleNodeKeyDown, isSelected}) => {
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
    >
      <h2>{text}</h2>
      <div
        className="connection-point"
        tabIndex={0}
        onMouseDown={(e) => handleConnectionMouseDown(e, id)}
      />
    </div>
  );
};

export default FlowchartNode;