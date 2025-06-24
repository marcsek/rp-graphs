import { ReactFlowProvider } from "@xyflow/react";
import BasicGraph from "./BasicGraph/BasicGraph";
import BipartiteGraph from "./BipartiteGraph/BipartiteGraph";
import "./Graph.css";
import HasseDiagram from "./HasseDiagram/HasseDiagram";

function Graphs({ selectedGraphs }: { selectedGraphs: string[] }) {
    return (
        <div className="graphs-layout">
            {selectedGraphs.includes("Hasse") && (
                <ReactFlowProvider>
                    <HasseDiagram />
                </ReactFlowProvider>
            )}
            {selectedGraphs.includes("Basic") && (
                <ReactFlowProvider>
                    <BasicGraph />
                </ReactFlowProvider>
            )}
            {selectedGraphs.includes("Bipartite") && (
                <ReactFlowProvider>
                    <BipartiteGraph />
                </ReactFlowProvider>
            )}
        </div>
    );
}

export default Graphs;
