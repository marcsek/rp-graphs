import type { DirectEdgeType } from "../graphComponents/DirectEdge";
import type { Plugin } from "../plugins";
import type { BipartiteNodeType } from "./BipartiteGraph";

export type BipartiteGraphState = {
    nodes: BipartiteNodeType[];
    edges: DirectEdgeType[];
    selectedPreds: string[];
    selectedNodes: string[];
};

const createNode = (
    id: string,
    origin: BipartiteNodeType["data"]["origin"],
    hidden = false,
): BipartiteNodeType => {
    return {
        id: `${origin === "domain" ? "d" : "r"}-${id}`,
        type: "predicate",
        position: { x: 0, y: 0 },
        data: { label: id, origin },
        hidden,
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
            selectedNodes: [...new Set(struct.iP[predicate].flat())],
        };

        struct.domain.forEach((domElement) => {
            const hidden = !graph.selectedNodes.includes(domElement);
            graph.nodes.push(createNode(domElement, "domain", hidden));
            graph.nodes.push(createNode(domElement, "range", hidden));
        });

        iP.forEach(([source, target]) => {
            graph.edges.push(createEdge(source, target));
        });

        return graph;
    },

    syncNodes(prev, domain) {
        const nodeById = new Map(prev.nodes.map((n) => [n.id, n]));

        const newNodes = domain.flatMap((element) => [
            nodeById.get(`d-${element}`) ?? createNode(element, "domain", true),
            nodeById.get(`r-${element}`) ?? createNode(element, "range", true),
        ]);

        const selectedNodes = newNodes
            .filter((node) => !node.hidden)
            .map((node) => node.id.slice("d-".length));

        return { ...prev, nodes: newNodes, selectedNodes };
    },

    hideNodes(prev, toggledNode) {
        let selected = [...prev.selectedNodes];
        if (selected.includes(toggledNode))
            selected = selected.filter((pred) => pred != toggledNode);
        else selected.push(toggledNode);

        const newNodes = prev.nodes.map((node) => ({
            ...node,
            hidden: !selected.includes(node.id.slice("d-".length)),
        }));

        return { ...prev, nodes: newNodes, selectedNodes: selected };
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
