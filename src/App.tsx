import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "./App.css";
import Graphs from "./Graph";

function App() {
  return (
    <>
      <ReactFlowProvider>
        <Graphs />
      </ReactFlowProvider>
    </>
  );
}

export default App;
