
import './FlowchartNode.css';

const FlowchartNode = ({id, x, y, text, onMouseDown, handleConnectionMouseDown, handleNodeKeyDown}) => {

  return (
    <div
      className="flowchart-node"
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