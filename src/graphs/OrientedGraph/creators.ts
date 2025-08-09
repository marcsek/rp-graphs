import type { Structure } from "../../components/StructureExplorer/structure.type";
import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { PredicateNodeType } from "../graphComponents/PredicateNode";
import type { OrientedGraphState } from "../graphSlice";

export const createNode = (id: string): PredicateNodeType => {
    return {
        id: id,
        type: "predicate",
        position: { x: 0, y: 0 },
        data: { label: id },
        //hidden: !iP.flat().includes(domElement),
    };
};

export const createEdge = (source: string, target: string): DirectEdgeType => {
    return {
        id: `eg-${source}->${target}`,
        source,
        target,
    };
};

export const convertPredicateToOrientedGraph = (
    struct: Structure,
    binaryPred: string,
) => {
    const graph: OrientedGraphState = {
        nodes: [],
        edges: [],
    };

    const iP = struct.iP[binaryPred];

    struct.domain.forEach((domElement) => {
        graph.nodes.push(createNode(domElement));
    });

    iP.forEach(([source, target]) => {
        graph.edges.push(createEdge(source, target));
    });

    return graph;
};
