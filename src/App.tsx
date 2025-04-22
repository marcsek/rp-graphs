import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "./App.css";
import Graphs from "./Graph";
import StructureExplorer from "./StructureExplorer/StructureExplorer";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "2rem",
      }}
    >
      <StructureExplorer />
      <Graphs />
    </div>
  );
}

export default App;
