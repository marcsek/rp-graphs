import "../BasicGraph/BasicGraph.css";
import "@xyflow/react/dist/style.css";
import "./HasseDiagram.css";

import {
    Background,
    ConnectionMode,
    DefaultEdgeOptions,
    Edge,
    MarkerType,
    ReactFlow,
    useReactFlow,
    Node,
    NodeChange,
    Controls,
} from "@xyflow/react";

import { useCallback } from "react";
import FloatingEdge from "../BasicGraph/FloatingEdge";
import CustomConnectionLine from "../BasicGraph/CustomConnectionLine";
import dagre from "@dagrejs/dagre";
import { isValidHasseWithEdge } from "./PosetHelper";
import AddNodeButton from "../BasicGraph/AddNodeButton";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    makeConnection,
    nodeAdded,
    NodeType,
    onNodesChange,
    setEdges,
    setNodes,
    updateEdges,
} from "./hasseDiagramSlice";
import HasseNode from "./HasseNode";
import CustomControls from "../BasicGraph/CustomConstrols";

const connectionLineStyle = {
    stroke: "#22C55E99",
    strokeWidth: 2,
};

const nodeTypes = {
    custom: HasseNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    type: "floating",
    style: {
        stroke: "#b1b1b7",
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
    },
};

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

function HasseDiagram() {
    const dispatch = useAppDispatch();
    const nodes = useAppSelector((state) => state.hasse.nodes);
    const edges = useAppSelector((state) => state.hasse.edges);
    const domain = useAppSelector((state) => state.explorer.domain);
    const isPoset = useAppSelector((state) => state.hasse.isPoset);
    const predicateName = useAppSelector(
        (state) => state.explorer.mainPredicate.name,
    );
    const { fitView } = useReactFlow();

    const addNodeWithId = (id: string, x: number, y: number) => {
        dispatch(nodeAdded({ id, x, y }));
    };

    //const reduce = () => {
    //  setEdges((prev) => {
    //    const initialEdges = [];
    //    console.log(prev);
    //    console.log("RELATION", prev);
    //    //console.log("REDUCE", hasseEdgesFullClosure(prev));
    //    const relation = prev.map((e) => [e.source, e.target]);
    //    hasseEdgesFullClosure(relation).forEach(([a, b]) => {
    //      const aa = a
    //        .replace(/[{}]/g, "")
    //        .split(",")
    //        .map((num) => num.trim());
    //      const bb = b
    //        .replace(/[{}]/g, "")
    //        .split(",")
    //        .map((num) => num.trim());
    //      return initialEdges.push({
    //        id: `e${aa.toString()}${bb.toString()}`,
    //        source: `{${aa.toString()}}`,
    //        target: `{${bb.toString()}}`,
    //      });
    //    });
    //    return initialEdges;
    //  });
    //};

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
            {!isPoset && (
                <div className="posetInfo">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                    {`Interpretation of '${predicateName}' is not a poset`}
                </div>
            )}
            <ReactFlow
                id="4"
                nodes={nodes}
                edges={edges}
                onNodesChange={(e) =>
                    dispatch(onNodesChange(e as NodeChange<NodeType>[]))
                }
                onEdgesChange={(e) => dispatch(updateEdges(e))}
                proOptions={{ hideAttribution: true }}
                onConnect={(e) => dispatch(makeConnection(e))}
                isValidConnection={(e) => {
                    const relation = edges.map((e) => [e.source, e.target]);
                    return isValidHasseWithEdge(relation, [e.source, e.target]);
                }}
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
                <Background />
                <CustomControls onLayout={onLayout} />
            </ReactFlow>
            <AddNodeButton
                elements={domain}
                onAdd={(id) => addNodeWithId(id, 0, 0)}
            />
        </div>
    );
}

export default HasseDiagram;
