import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { Plugin } from "../plugins";
import type { BipartiteNodeType } from "./BipartiteGraph";

export type BipartiteGraphState = {
    nodes: BipartiteNodeType[];
    edges: DirectEdgeType[];
    selectedPreds: string[];
};

const createNode = (
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

const createEdge = (source: string, target: string): DirectEdgeType => {
    return {
        id: `eg-${source}->${target}`,
        source: `d-${source}`,
        target: `r-${target}`,
    };
};

export const bipartiteGraphPlugin: Plugin<"bipartite"> = {
    init(struct, predicate) {
        const iP = struct.iP[predicate];

        const graph: BipartiteGraphState = {
            nodes: [],
            edges: [],
            selectedPreds: [],
        };

        struct.domain.forEach((domElement) => {
            graph.nodes.push(createNode(domElement, "domain"));
            graph.nodes.push(createNode(domElement, "range"));
        });

        iP.forEach(([source, target]) => {
            graph.edges.push(createEdge(source, target));
        });

        return graph;
    },

    syncNodes(prev, domain) {
        const nodeById = new Map(prev.nodes.map((n) => [n.id, n]));

        const newNodes = domain.flatMap((element) => [
            nodeById.get(`d-${element}`) ?? createNode(element, "domain"),
            nodeById.get(`r-${element}`) ?? createNode(element, "range"),
        ]);
        console.log(newNodes);

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
        return state.edges.map(({ source, target }) => [
            source.slice("d-".length),
            target.slice("r-".length),
        ]);
    },
};
