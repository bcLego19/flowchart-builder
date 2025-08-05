// components/Toolbar/Toolbar.jsx

// The toolbar component, which accepts a createNode property
const Toolbar = ({createNode}) => {
  return (
    <div>
      <h2>Toolbar</h2>
      <button onClick={createNode()}>Add</button>
    </div>
  );
};

export default Toolbar;