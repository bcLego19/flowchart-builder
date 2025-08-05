// components/Toolbar/Toolbar.jsx

// The toolbar component, which accepts a createNode property
const Toolbar = ({createNode}) => {
  return (
    <div>
      <h2 className="toolbar">Toolbar</h2>
      <button className="add-node-btn" onClick={createNode}>Add</button>
    </div>
  );
};

export default Toolbar;