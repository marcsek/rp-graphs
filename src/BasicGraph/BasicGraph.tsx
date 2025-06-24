import "./BasicGraph.css";
import "@xyflow/react/dist/style.css";

import {
    Background,
    ConnectionMode,
    Node,
    Edge,
    DefaultEdgeOptions,
    MarkerType,
    NodeChange,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";
import FloatingEdge from "./FloatingEdge";
import CustomNode from "./CustomNode";
import CustomConnectionLine from "./CustomConnectionLine";
import SelfConnectingEdge from "./SelfConnectingEdge";
import AddNodeButton from "./AddNodeButton";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    makeConnection,
    nodeAdded,
    NodeType,
    onNodesChange,
    predFocused,
    predUnfocused,
    setEdges,
    setNodes,
    togglePredicate,
    updateEdges,
} from "./basicGraphSlice";
import CustomControls from "./CustomConstrols";
import dagre from "@dagrejs/dagre";
import { useCallback } from "react";

const computeLayout = <TNode extends Node, TEdge extends Edge>(
    nodes: TNode[],
    edges: TEdge[],
) => {
    const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(
        () => ({}),
    );
    dagreGraph.setGraph({ rankdir: "BT" });

    nodes.forEach((n) => dagreGraph.setNode(n.id, { width: 120, height: 80 }));
    edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

    dagre.layout(dagreGraph);
    const offsetX = dagreGraph.graph().width / 2;
    const offsetY = dagreGraph.graph().height / 2;

    const newNodes = nodes.map((n) => {
        const nodeWithPosition = dagreGraph.node(n.id);
        return {
            ...n,
            position: {
                x: nodeWithPosition.x - 120 / 2 - offsetX,
                y: nodeWithPosition.y - 80 / 2 - offsetY,
            },
        };
    });

    return { nodes: newNodes, edges };
};

const connectionLineStyle = {
    stroke: "#22C55E99",
    strokeWidth: 2,
};

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    floating: FloatingEdge,
    selfConnecting: SelfConnectingEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    type: "floating",
    style: {
        //stroke: "#b1b1b7",
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
    },
};

function BasicGraph() {
    const nodes = useAppSelector((state) => state.graph.nodes);
    const edges = useAppSelector((state) => state.graph.edges);
    const domain = useAppSelector((state) => state.explorer.domain);
    const { fitView } = useReactFlow();
    const unaryPredicates = useAppSelector(
        (state) => state.explorer.unaryPredicates,
    );
    const selectedPredicates = useAppSelector(
        (state) => state.graph.selectedPreds,
    );
    const dispatch = useAppDispatch();
    const addNodeWithId = (id: string, x: number, y: number) => {
        dispatch(nodeAdded({ id, x, y }));
    };

    const onLayout = useCallback(() => {
        const { nodes: lNodes, edges: lEdges } = computeLayout(nodes, edges);

        dispatch(setNodes(lNodes));
        dispatch(setEdges(lEdges));
        //setNodes([...lNodes]);
        //setEdges([...lEdges]);
        fitView({ duration: 500 });
    }, [nodes, edges]);

    return (
        <div className="graph-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(e) =>
                    dispatch(onNodesChange(e as NodeChange<NodeType>[]))
                }
                minZoom={0.3}
                onEdgesChange={(e) => dispatch(updateEdges(e))}
                proOptions={{ hideAttribution: true }}
                onConnect={(e) => dispatch(makeConnection(e))}
                zoomOnDoubleClick={false}
                defaultEdgeOptions={defaultEdgeOptions}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                connectionLineComponent={CustomConnectionLine}
                connectionLineStyle={connectionLineStyle}
                connectionMode={ConnectionMode.Loose}
                connectionRadius={55}
                fitView
            >
                <Background id="2" />
                <CustomControls onLayout={onLayout} />
            </ReactFlow>
            {unaryPredicates.map((p) => (
                <label
                    key={p.name}
                    onMouseEnter={() => dispatch(predFocused(p.name))}
                    onMouseLeave={() => dispatch(predUnfocused())}
                >
                    <input
                        type="checkbox"
                        checked={selectedPredicates.includes(p.name)}
                        onChange={() => dispatch(togglePredicate(p.name))}
                    />
                    {p.name}
                </label>
            ))}
            <AddNodeButton
                elements={domain}
                onAdd={(id) => addNodeWithId(id, 0, 0)}
            />
        </div>
    );
}

export default BasicGraph;
