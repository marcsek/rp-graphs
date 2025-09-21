import type { GraphType } from "../../graphs/plugins";
import NodeSelector from "../NodeSelector/NodeSelector";
import PredicateSelector from "../PredicateSelector/PredicateSelector";

export default function GraphHUD({
    id,
    type,
    typeSelected,
}: {
    id: string;
    type: GraphType;
    typeSelected: (type: GraphType) => void;
}) {
    return (
        <div>
            <em>{`ID: ${type}-${id}`}</em>
            <div>
                <h4>Graph Types</h4>
                <div>
                    <button onClick={() => typeSelected("oriented")}>
                        Oriented
                    </button>
                    <button onClick={() => typeSelected("hasse")}>Hasse</button>
                    <button onClick={() => typeSelected("bipartite")}>
                        Bipartite
                    </button>
                </div>
            </div>
            <PredicateSelector id={id} type={type} />
            <NodeSelector id={id} type={type} />
        </div>
    );
}
