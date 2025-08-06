
import './FlowchartNode.css';

const FlowchartNode = ({id, x, y, text, onMouseDown}) => {

  const handleConnectionMouseDown = (e) => {
    e.stopPropagation();

    cosnole.log(`Connection point clicked on node: (${id})`);
  }

  return (
    <div
      className="flowchart-node"
      style={{ left: x, top: y }}
      onMouseDown={onMouseDown}
    >
      <h2>{text}</h2>
      <div
        className="connection-point"
        onMouseDown={handleConnectionMouseDown}
      />
    </div>
  );
};

export default FlowchartNode;