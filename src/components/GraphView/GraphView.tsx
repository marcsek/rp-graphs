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

type SelectedGraphs = Record<string, "oriented" | "hasse">;

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
    }, []);

    const setSelection = (name: string, newType: SelectedGraphs[string]) => {
        setSelectedGraphs((prev) => ({ ...prev, [name]: newType }));
    };

    return (
        <div className="graphViewContainer">
            {Object.entries(selectedGraphs).map(([name, graphType]) => (
                <div className="graphViewItem" key={name}>
                    <div>
                        <button onClick={() => setSelection(name, "oriented")}>
                            Oriented
                        </button>
                        <button onClick={() => setSelection(name, "hasse")}>
                            Hasse
                        </button>
                    </div>
                    {graphType === "oriented" ? (
                        <OrientedGraph id={name} key={name} />
                    ) : (
                        <HasseDiagram id={name} key={name} />
                    )}
                </div>
            ))}
        </div>
    );
}
