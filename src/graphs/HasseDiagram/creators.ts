import type { Structure } from "../../components/StructureExplorer/structure.type";
import type { HasseDiagramState } from "../graphSlice";
import { createEdge, createNode } from "../OrientedGraph/creators";
import {
    isPoset,
    reducePosetRelations,
    type BinaryRelation,
} from "./posetHelpers";

export const convertPredicateToHasseDiagram = (
    struct: Structure,
    binaryPred: string,
) => {
    const iP = struct.iP[binaryPred] as BinaryRelation<string>;

    const graph: HasseDiagramState = {
        nodes: [],
        edges: [],
        isPoset: true,
    };

    if (!isPoset(iP as [string, string][])) {
        graph.isPoset = false;
        return graph;
    }

    struct.domain.forEach((domElement) => {
        graph.nodes.push(createNode(domElement));
    });

    const hasseEdges = reducePosetRelations(iP);
    hasseEdges.forEach(([source, target]) => {
        graph.edges.push(createEdge(source, target));
    });

    return graph;
};
