import "./App.css";
import "./graphs/xy-graph.css";

import GraphView from "./components/GraphView/GraphView";
import StructureExplorer from "./components/StructureExplorer/StructureExplorer";

function App() {
    return (
        <>
            <StructureExplorer />
            <GraphView />
        </>
    );
}

export default App;
