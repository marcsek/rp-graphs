import {
    Background,
    ReactFlow,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type OnConnect,
    MarkerType,
    type IsValidConnection,
    type DefaultEdgeOptions,
    type EdgeTypes,
    type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
//import DevTools from "../../helpers/Devtools";
import PredicateNodeComponent, {
    type PredicateNodeType,
} from "../graphComponents/PredicateNode";
import DirectEdge from "../graphComponents/DirectEdge";
import CustomConnectionLine from "../graphComponents/DirectConnectionLine";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { onConnected, onEdgesChanged, onNodesChanged } from "../graphSlice.ts";
import { staysValidHasseWithEdge, type BinaryRelation } from "./posetHelpers";
import PredicateSelector from "../../components/PredicateSelector/PredicateSelector.tsx";

const connectionLineStyle = {
    stroke: "#b1b1b7",
};

const nodeTypes: NodeTypes = {
    predicate: PredicateNodeComponent,
};

const edgeTypes: EdgeTypes = {
    direct: DirectEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    type: "direct",
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
    },
};

export default function HasseDiagram({ id }: { id: string }) {
    const type = "hasse";

    const dispatch = useAppDispatch();
    const nodes = useAppSelector((state) => state.graphState[id][type]?.nodes);
    const edges = useAppSelector((state) => state.graphState[id][type]?.edges);
    const isPoset = useAppSelector(
        (state) => state.graphState[id][type].isPoset,
    );

    const onNodesChange = useCallback(
        (changes: NodeChange<PredicateNodeType>[]) =>
            dispatch(onNodesChanged({ id, type, changes })),
        [id, dispatch],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) =>
            dispatch(onEdgesChanged({ id, type, changes })),
        [id, dispatch],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => dispatch(onConnected({ id, type, connection })),
        [id, dispatch],
    );

    const isValidConnection: IsValidConnection = useCallback(
        (newEdge) => {
            const relation: BinaryRelation<string> = edges.map((e) => [
                e.source,
                e.target,
            ]);

            return staysValidHasseWithEdge(relation, [
                newEdge.source,
                newEdge.target,
            ]);
        },
        [edges],
    );

    return (
        <>
            <p>{`hasse-${id}`}</p>
            <p>{`Is Poset: ${isPoset}`}</p>
            <div style={{ width: "100%", flexGrow: 1 }}>
                <ReactFlow
                    id={`hasse-${id}`}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineComponent={CustomConnectionLine}
                    connectionLineStyle={connectionLineStyle}
                    isValidConnection={isValidConnection}
                >
                    <Background id={`bg-hasse-${id}`} />
                    {/* <DevTools /> */}
                </ReactFlow>
            </div>
            <PredicateSelector id={id} type={type} />
        </>
    );
}
