import {
    Background,
    ReactFlow,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type OnConnect,
    ReactFlowProvider,
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

export default function OrientedGraph({ id }: { id: string }) {
    const type = "oriented";

    const dispatch = useAppDispatch();
    const nodes = useAppSelector((state) => state.graphState[id][type]?.nodes);
    const edges = useAppSelector((state) => state.graphState[id][type]?.edges);

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
        (newEdge) =>
            // no duplicate edges
            !edges.some(
                (edge) =>
                    newEdge.source === edge.source &&
                    newEdge.target === edge.target,
            ),
        [edges],
    );

    return (
        <>
            <p>{`oriented-${id}`}</p>
            <ReactFlowProvider>
                <div style={{ width: "100%", flexGrow: 1 }}>
                    <ReactFlow
                        id={id}
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
                        <Background id={`bg-oriented-${id}`} />
                        {/* <DevTools /> */}
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </>
    );
}
