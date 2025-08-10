import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { PredicateNodeType } from "../graphComponents/PredicateNode";
import type { Plugin } from "../plugins";

export type OrientedGraphState = {
    nodes: PredicateNodeType[];
    edges: DirectEdgeType[];
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

export const orientedGraphPlugin: Plugin<"oriented"> = {
    init(struct, predicate) {
        const graph: OrientedGraphState = {
            nodes: [],
            edges: [],
            selectedPreds: [],
        };

        const iP = struct.iP[predicate];

        struct.domain.forEach((domElement) =>
            graph.nodes.push(createNode(domElement)),
        );

        iP.forEach(([source, target]) =>
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
        const edgeById = new Map(prev.edges.map((e) => [e.id, e]));

        const newEdges = intr.map(
            ([from, to]) =>
                edgeById.get(`eg-${from}->${to}`) ?? createEdge(from, to),
        );

        return { ...prev, edges: newEdges };
    },

    edgesToRelation(state) {
        return state.edges.map(({ source, target }) => [source, target]);
    },
};
