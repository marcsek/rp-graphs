import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "./App.css";
import Graphs from "./Graph";
import StructureExplorer from "./StructureExplorer/StructureExplorer";
import smallStruct from "./structPresets/smallStruct";
import smallPosetStruct from "./structPresets/smallPosetStruct";
import mediumPosetStruct from "./structPresets/mediumPosetStruct";
import bigPosetStruct from "./structPresets/bigPosetStruct";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { structureChanged } from "./StructureExplorer/structExplorerSlice";

const structs = ["Small", "Small Poset", "Medium Poset", "Big Poset"] as const;
const structsPresets = [
  smallStruct,
  smallPosetStruct,
  mediumPosetStruct,
  bigPosetStruct,
];

function App() {
  const dispatch = useDispatch();
  const [selectedStruct, setSelectedStruct] =
    useState<(typeof structs)[number]>("Small");
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([
    "Hasse",
    "Basic",
    "Bipartite",
  ]);

  const handleSelectedStruct = (s: (typeof structs)[number]) => {
    if (selectedStruct !== s) {
      dispatch(structureChanged(structsPresets[structs.indexOf(s)]));
    }
    setSelectedStruct(s);
  };

  const handleSelectedGraph = (g: string) => {
    if (selectedGraphs.includes(g))
      setSelectedGraphs((prev) => prev.filter((gr) => gr !== g));
    else setSelectedGraphs((prev) => [...prev, g]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "2rem",
      }}
    >
      <div className="header">
        <div className="selectedStructContainer">
          {structs.map((s) => (
            <span
              className={`structName ${s === selectedStruct ? "selectedName" : ""}`}
              onClick={() => handleSelectedStruct(s)}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="selectedGraphContainer">
          {["Hasse", "Basic", "Bipartite"].map((g) => (
            <span
              className={`structName ${selectedGraphs.includes(g) ? "selectedName" : ""}`}
              onClick={() => handleSelectedGraph(g)}
            >
              {g}
            </span>
          ))}
        </div>
      </div>
      <StructureExplorer />
      <Graphs selectedGraphs={selectedGraphs} />
    </div>
  );
}

export default App;
