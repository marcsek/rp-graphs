import {
    Background,
    ReactFlow,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type OnConnect,
    MarkerType,
    type DefaultEdgeOptions,
    type EdgeTypes,
    type NodeTypes,
    applyNodeChanges,
    type NodePositionChange,
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
import { onConnected, onEdgesChanged, setNodes } from "./bipartiteGraphSlice";

export type BipartiteNodeType = PredicateNodeType<{
    origin: "domain" | "range";
}>;

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

const applyNodeChangesWithLayout = (
    changes: NodeChange<BipartiteNodeType>[],
    nodes: BipartiteNodeType[],
) => {
    const newNodes = applyNodeChanges(changes, nodes);

    const draggedNodeIds = changes
        .filter(
            (change): change is NodePositionChange =>
                change.type === "position" && !!change.dragging,
        )
        .map((change) => change.id);

    let domainY = 0,
        rangeY = 0;

    const ordered = newNodes.sort((a, b) => a.position.y - b.position.y);

    const positionedNodes = ordered.map((node) => {
        const origin = node.data.origin;
        const x = origin === "domain" ? -100 : 100;
        let y = origin === "domain" ? domainY : rangeY;

        const newNode = draggedNodeIds.includes(node.id)
            ? { ...node, position: { x, y: node.position.y } }
            : { ...node, position: { x, y } };

        domainY += origin === "domain" ? 200 : 0;
        rangeY += origin === "range" ? 200 : 0;

        return newNode;
    });

    return positionedNodes;
};

export default function BipartiteGraph({ id }: { id: string }) {
    const dispatch = useAppDispatch();
    const nodes = useAppSelector((state) => state.bipartiteGraph[id]?.nodes);
    const edges = useAppSelector((state) => state.bipartiteGraph[id]?.edges);

    const onNodesChange = useCallback(
        (changes: NodeChange<BipartiteNodeType>[]) =>
            dispatch(
                setNodes({
                    id,
                    nodes: applyNodeChangesWithLayout(changes, nodes),
                }),
            ),
        [nodes],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) =>
            dispatch(onEdgesChanged({ id, changes })),
        [],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => dispatch(onConnected({ id, connection })),
        [],
    );

    return (
        <>
            <p>{`bipartite-${id}`}</p>
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
                >
                    <Background id={`bg-bipartite-${id}`} />
                    {/* <DevTools /> */}
                </ReactFlow>
            </div>
        </>
    );
}
