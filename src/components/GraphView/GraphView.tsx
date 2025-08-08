import "./GraphView.css";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import OrientedGraph from "../../graphs/OrientedGraph/OrientedGraph";
import {
    selectBinaryPreds,
    setStructure as setStructureOriented,
} from "../../graphs/OrientedGraph/orientedGraphSlice";
import { initialState as initialStateStruct } from "../StructureExplorer/structureSlice";
import { initialState as initialStateLang } from "../StructureExplorer/languageSlice";
import HasseDiagram from "../../graphs/HasseDiagram/HasseDiagram";
import { setStructure as setStructureHasse } from "../../graphs/HasseDiagram/hasseDiagramSlice";
import { setStructure as setStructureBipartite } from "../../graphs/BipartiteGraph/bipartiteGraphSlice.ts";
import BipartiteGraph from "../../graphs/BipartiteGraph/BipartiteGraph.tsx";
import { ReactFlowProvider } from "@xyflow/react";

type SelectedGraphs = Record<string, "oriented" | "hasse" | "bipartite">;

export default function GraphView() {
    const dispatch = useAppDispatch();

    const binaryPreds = useAppSelector(selectBinaryPreds);

    const [selectedGraphs, setSelectedGraphs] = useState<SelectedGraphs>({});

    useEffect(() => {
        const graphSelection: SelectedGraphs = {};
        binaryPreds.forEach((pred) => {
            graphSelection[pred.name] = "oriented";
        });
        setSelectedGraphs(graphSelection);
    }, [binaryPreds]);

    useEffect(() => {
        dispatch(
            setStructureOriented({
                struct: initialStateStruct,
                lang: initialStateLang,
            }),
        );

        dispatch(
            setStructureHasse({
                struct: initialStateStruct,
                lang: initialStateLang,
            }),
        );

        dispatch(
            setStructureBipartite({
                struct: initialStateStruct,
                lang: initialStateLang,
            }),
        );
    }, [dispatch]);

    const setSelection = (name: string, newType: SelectedGraphs[string]) => {
        setSelectedGraphs((prev) => ({ ...prev, [name]: newType }));
    };

    const graphComponents: Record<
        SelectedGraphs[string],
        React.ComponentType<{ id: string }>
    > = {
        oriented: OrientedGraph,
        hasse: HasseDiagram,
        bipartite: BipartiteGraph,
    };

    return (
        <div className="graphViewContainer">
            {Object.entries(selectedGraphs).map(([name, graphType]) => {
                const GraphComponent = graphComponents[graphType];

                return (
                    <div className="graphViewItem" key={name}>
                        <div>
                            <button
                                onClick={() => setSelection(name, "oriented")}
                            >
                                Oriented
                            </button>
                            <button onClick={() => setSelection(name, "hasse")}>
                                Hasse
                            </button>
                            <button
                                onClick={() => setSelection(name, "bipartite")}
                            >
                                Bipartite
                            </button>
                        </div>
                        <ReactFlowProvider>
                            <GraphComponent id={name} />
                        </ReactFlowProvider>
                    </div>
                );
            })}
        </div>
    );
}
