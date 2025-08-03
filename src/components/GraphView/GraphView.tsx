import "./GraphView.css";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import OrientedGraph from "../../graphs/OrientedGraph/OrientedGraph";
import {
    selectBinaryPreds,
    setStructure,
} from "../../graphs/OrientedGraph/orientedGraphSlice";
import { initialState as initialStateStruct } from "../StructureExplorer/structureSlice";
import { initialState as initialStateLang } from "../StructureExplorer/languageSlice";

export default function GraphView() {
    const dispatch = useAppDispatch();

    const binaryPreds = useAppSelector(selectBinaryPreds);

    useEffect(() => {
        dispatch(
            setStructure({
                struct: initialStateStruct,
                lang: initialStateLang,
            }),
        );
    }, []);

    return (
        <div className="graphViewContainer">
            {binaryPreds.map((pred) => (
                <OrientedGraph id={pred.name} key={pred.name} />
            ))}
        </div>
    );
}
