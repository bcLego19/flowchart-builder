
import './FlowchartNode.css';

const FlowchartNode = ({id, x, y, text, onMouseDown}) => {
  return (
    <div
      className="flowchart-node"
      style={{ left: x, top: y }}
      onMouseDown={onMouseDown}
    >
      <h2>{text}</h2>
      <div
        className="connection-point"
      >
        
      </div>
    </div>
  );
};

export default FlowchartNode;