import type { Structure } from "../../components/StructureExplorer/structure.type";
import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { BipartiteGraphState } from "../graphSlice";
import type { BipartiteNodeType } from "./BipartiteGraph";

export const createNode = (
    id: string,
    origin: BipartiteNodeType["data"]["origin"],
): BipartiteNodeType => {
    return {
        id: `${origin === "domain" ? "d" : "r"}-${id}`,
        type: "predicate",
        position: { x: 0, y: 0 },
        data: { label: id, origin },
        //hidden: !iP.flat().includes(domElement),
    };
};

export const createEdge = (source: string, target: string): DirectEdgeType => {
    return {
        id: `eg-${source}->${target}`,
        source: `d-${source}`,
        target: `r-${target}`,
    };
};

export const convertPredicateToBipartiteGraph = (
    struct: Structure,
    binaryPred: string,
) => {
    const iP = struct.iP[binaryPred];

    const graph: BipartiteGraphState = {
        nodes: [],
        edges: [],
    };

    struct.domain.forEach((domElement) => {
        graph.nodes.push(createNode(domElement, "domain"));
        graph.nodes.push(createNode(domElement, "range"));
    });

    iP.forEach(([source, target]) => {
        graph.edges.push(createEdge(source, target));
    });

    return graph;
};
