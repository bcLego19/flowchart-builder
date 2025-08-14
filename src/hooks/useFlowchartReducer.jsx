// src/hooks/useFlowchartReducer.js
export const initialState = {
  mode: 'idle', // 'idle' | 'panning' | 'dragging' | 'connecting'
  pan: { x: 0, y: 0 },
  startMouse: { x: 0, y: 0 },
  draggedNodeId: null,
  tempConnection: null,
  selectedConnectionSource: null,
};

export function flowchartReducer(state, action) {
  switch (action.type) {
    case 'PAN_START':
      return {
        ...state,
        mode: 'panning',
        startMouse: action.payload.startMouse,
      };
    case 'PAN_MOVE':
      return {
        ...state,
        pan: action.payload.pan,
        startMouse: action.payload.startMouse,
      };
    case 'DRAG_START':
      return {
        ...state,
        mode: 'dragging',
        draggedNodeId: action.payload.draggedNodeId,
        startMouse: action.payload.startMouse,
      };
    case 'DRAG_MOVE':
      return {
        ...state,
        startMouse: action.payload.startMouse,
      };
    case 'CONNECT_START':
      return {
        ...state,
        mode: 'connecting',
        tempConnection: action.payload.tempConnection,
        selectedConnectionSource: action.payload.sourceId,
      };
    case 'CONNECT_MOVE':
      return {
        ...state,
        tempConnection: action.payload.tempConnection,
      };
    case 'END_INTERACTION':
      return {
        ...state,
        mode: 'idle',
        draggedNodeId: null,
        tempConnection: null,
        isPanning: false, // Ensure this is also reset
      };
    case 'SELECT_NODE':
      return {
        ...state,
        selectedConnectionSource: action.payload.nodeId,
      };
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedConnectionSource: null,
        editingNodeId: null,
        contextMenu: {visible: false, x: 0, y: 0, nodeId: null},
      };
    default:
      return state;
  }
}