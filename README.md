# Flowchart Builder
A browser-based flowchart editor built with React. Supports multi-type nodes, drag-and-drop positioning, keyboard navigation, undo/redo history, and export to JSON, PDF, and PNG.

**Live Demo:** Not yet available

## Features
- Create, move, and connect nodes across multiple shape types
- Full keyboard accessibility with ARIA labels throughout
- Undo/redo history via useReducer
- Context menu for node and connection management
- Additive zoom and canvas panning
- Import/export flowcharts as JSON; export to PDF and PNG

## Tech Stack:
React, JavaScript, CSS Modules

## Development Approach
This project was built incrementally over 4 months, using Claude as a collaborative tool — not to generate the application wholesale, but to accelerate problem-solving at specific decision points. Architectural choices, component structure, state management patterns, and accessibility implementation were driven by deliberate engineering decisions. The commit history reflects that incremental process.

## Notable Engineering Decisions
- Migrated canvas state to useReducer for predictable mutation and easier undo/redo implementation
- Used React.memo and a shared context to minimize re-renders across node and connection components
- Implemented keyboard accessibility from scratch rather than relying on a library, including focus management and ARIA roles for both nodes and connections
- Chose client-side export (no backend) using canvas serialization for PNG and jsPDF for PDF output
