import { ReactFlowProvider } from "@xyflow/react";
import BasicGraph from "./BasicGraph/BasicGraph";
import BipartiteGraph from "./BipartiteGraph/BipartiteGraph";
import "./Graph.css";

function Graphs() {
  return (
    <div className="graphs-layout">
      <ReactFlowProvider>
        <BasicGraph />
      </ReactFlowProvider>
      <ReactFlowProvider>
        <BipartiteGraph />
      </ReactFlowProvider>
    </div>
  );
}

export default Graphs;
