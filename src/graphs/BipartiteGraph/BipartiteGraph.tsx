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
import { onConnected, onEdgesChanged, setNodes } from "../graphSlice.ts";
import PredicateSelector from "../../components/PredicateSelector/PredicateSelector.tsx";

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
        const y = origin === "domain" ? domainY : rangeY;

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
    const type = "bipartite";

    const dispatch = useAppDispatch();
    const nodes = useAppSelector((state) => state.graphState[id][type]?.nodes);
    const edges = useAppSelector((state) => state.graphState[id][type]?.edges);

    const onNodesChange = useCallback(
        (changes: NodeChange<BipartiteNodeType>[]) =>
            dispatch(
                setNodes({
                    id,
                    type,
                    nodes: applyNodeChangesWithLayout(changes, nodes),
                }),
            ),
        [nodes, id, dispatch],
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
            <PredicateSelector id={id} type={type} />
        </>
    );
}
