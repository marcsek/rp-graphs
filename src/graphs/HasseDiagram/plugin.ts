import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { PredicateNodeType } from "../graphComponents/PredicateNode";
import type { Plugin } from "../plugins";
import {
    expandReducedPoset,
    isPoset,
    reducePosetRelations,
    type BinaryRelation,
} from "./posetHelpers";

export type HasseDiagramState = {
    nodes: PredicateNodeType[];
    edges: DirectEdgeType[];
    isPoset: boolean;
    selectedPreds: string[];
};

const createNode = (id: string): PredicateNodeType => {
    return {
        id: id,
        type: "predicate",
        position: { x: 0, y: 0 },
        data: { label: id },
        //hidden: !iP.flat().includes(domElement),
    };
};

const createEdge = (source: string, target: string): DirectEdgeType => {
    return {
        id: `eg-${source}->${target}`,
        source,
        target,
    };
};

export const hasseDiagramPlugin: Plugin<"hasse"> = {
    init(struct, predicate) {
        const iP = struct.iP[predicate] as BinaryRelation<string>;

        const graph: HasseDiagramState = {
            nodes: [],
            edges: [],
            isPoset: true,
            selectedPreds: [],
        };

        if (!isPoset(iP as [string, string][])) {
            graph.isPoset = false;
            return graph;
        }

        struct.domain.forEach((domElement) =>
            graph.nodes.push(createNode(domElement)),
        );

        const hasseEdges = reducePosetRelations(iP);
        hasseEdges.forEach(([source, target]) =>
            graph.edges.push(createEdge(source, target)),
        );

        return graph;
    },

    syncNodes(prev, domain) {
        const nodeById = new Map(prev.nodes.map((n) => [n.id, n]));

        const newNodes = domain.map(
            (element) => nodeById.get(element) ?? createNode(element),
        );

        return { ...prev, nodes: newNodes };
    },

    syncPredIntr(prev, intr) {
        let newIntr = [...intr];
        const poset = isPoset(newIntr);

        if (poset) newIntr = reducePosetRelations(newIntr);
        else return { ...prev, isPoset: poset };

        const edgeById = new Map(prev.edges.map((e) => [e.id, e]));

        const newEdges = newIntr.map(
            ([from, to]) =>
                edgeById.get(`eg-${from}->${to}`) ?? createEdge(from, to),
        );

        return { ...prev, edges: newEdges, isPoset: poset };
    },

    edgesToRelation(state) {
        const relation = state.edges.map(({ source, target }) => [
            source,
            target,
        ]) as BinaryRelation<string>;

        const domain = state.nodes.map((node) => node.id);
        return expandReducedPoset(relation, new Set(domain));
    },
};
