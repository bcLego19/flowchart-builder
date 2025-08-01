const FlowchartNode = ({id, x, y, text}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '120px',
        padding: '10px',
        backgroundColor: 'white',
        border: '2px solid black',
        borderRadius: '5px',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
        textAlign: 'center',
        cursor: 'grab', 
      }}
    >
      <h2>{text}</h2>
    </div>
  );
};

export default FlowchartNode;