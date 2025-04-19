import {
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
  Node,
  applyNodeChanges,
  BackgroundVariant,
  NodeChange,
  NodePositionChange,
  useReactFlow,
} from "@xyflow/react";
import "../BasicGraph/BasicGraph.css";

import "@xyflow/react/dist/style.css";
import BipartiteNode from "./BipartiteNode";
import ButtonAddNode from "./ButtonAddNode";
import { useCallback, useEffect } from "react";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "1", constant: "Bob", isFromDomain: true },
    type: "bipartiteDomain",
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "2", constant: "Alice", isFromDomain: true },
    type: "bipartiteDomain",
  },
  {
    id: "+1",
    position: { x: 0, y: 200 },
    data: { isFromDomain: true },
    type: "bipartiteButton",
    draggable: false,
    deletable: false,
  },
  {
    id: "3",
    position: { x: 300, y: 0 },
    data: { label: "1", constant: "Bob", isFromDomain: false },
    type: "bipartiteDomain",
  },
  {
    id: "4",
    position: { x: 300, y: 100 },
    data: { label: "2", constant: "Alice", isFromDomain: false },
    type: "bipartiteDomain",
  },
  {
    id: "+2",
    position: { x: 300, y: 200 },
    data: { isFromDomain: false },
    type: "bipartiteButton",
    draggable: false,
    deletable: false,
  },
];

const nodeTypes = {
  bipartiteDomain: BipartiteNode,
  bipartiteButton: ButtonAddNode,
};

let idCounter = 10;

function BipartiteGraph() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const onAddNode = (adderId: string, type: "domain" | "range") => {
      setNodes((nodes) => {
        //console.log(nodes);
        const maxDepthNode = nodes
          .filter(
            (n) =>
              n.type === "bipartiteDomain" &&
              ((type === "domain" && n.data.isFromDomain) ||
                (type === "range" && !n.data.isFromDomain)),
          )
          .reduce((a, b) => (a.position.y > b.position.y ? a : b));

        const newNode: Node = {
          id: idCounter.toString(),
          position: {
            x: maxDepthNode.position.x,
            y: maxDepthNode.position.y + 100,
          },
          data: {
            label: type + idCounter,
            constant: "Alice",
            isFromDomain: maxDepthNode.data.isFromDomain,
          },
          type: "bipartiteDomain",
        };
        idCounter++;

        return [...nodes, newNode].map((e) => {
          if (e.id === adderId) {
            return {
              ...e,
              position: { ...e.position, y: newNode.position.y + 100 },
            };
          }
          return e;
        });
      });
      fitView({ duration: 500 });
    };

    setNodes((prev) =>
      prev.map((e) => {
        if (e.type !== "bipartiteButton") return e;
        return { ...e, data: { ...e.data, onAddNode } };
      }),
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    //console.log(nodes);
  }, [nodes]);

  const onNodeDelete = (nodeToDelete: Node, prev: Node[]) => {
    //console.log(prev);
    const orderedByPosY = prev
      .filter((n) => n.id != nodeToDelete.id)
      .sort((a, b) => a.position.y - b.position.y);
    let currentY = 0;
    return orderedByPosY.map((node) => {
      if (node.data.isFromDomain != nodeToDelete.data.isFromDomain) return node;
      const newNode = { ...node, position: { ...node.position, y: currentY } };
      node.position.y = currentY;
      currentY += 100;
      return newNode;
    });
    for (const node of orderedByPosY) {
      if (node.data.isFromDomain != nodeToDelete.data.isFromDomain) continue;
      //console.log(node.position.y, currentY);
      node.position.y = currentY;
      currentY += 100;
    }
    //console.log(orderedByPosY);
    return orderedByPosY;
  };

  const onNodePosition = (change: NodePositionChange, nodes: Node[]) => {
    const changedNode = nodes.find((n) => n.id === change.id);
    const newNodes = nodes.map((n) => {
      if (n.id !== change.id) return n;
      return {
        ...n,
        position: { ...n.position, y: change.position.y },
      };
    });
    if (!change.dragging) {
      const orderedByPosY = newNodes.sort(
        (a, b) => a.position.y - b.position.y,
      );
      let currentY = 0;
      return orderedByPosY.map((node) => {
        if (
          node.data.isFromDomain != changedNode.data.isFromDomain ||
          node.type === "bipartiteButton"
        )
          return node;
        const newNode = {
          ...node,
          position: { ...node.position, y: currentY },
        };
        node.position.y = currentY;
        currentY += 100;
        return newNode;
      });
    }
    return newNodes;
  };

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds) => {
        //console.log(changes);
        const deleteEvents = changes.filter((ch) => ch.type === "remove");
        const positionEvents = changes.filter((ch) => ch.type === "position");
        const other = changes.filter(
          (ch) => ch.type !== "remove" && ch.type !== "position",
        );
        console.log(nds);
        console.log(changes);

        const reposNodes =
          positionEvents.length > 0
            ? onNodePosition(positionEvents[0], nds)
            : nds;

        const deleteChanges =
          deleteEvents.length > 0
            ? onNodeDelete(
                reposNodes.find((n) => n.id === deleteEvents[0].id),
                reposNodes,
              )
            : reposNodes;

        const otherChanges = applyNodeChanges(other, deleteChanges);
        //console.log(otherChanges);
        return otherChanges;
      }),
    [setNodes],
  );

  //const onLayout = useCallback(() => {
  //}, [nodes, edges]);

  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        //nodesDraggable={false}
        fitView
      >
        <Background id="1" />
      </ReactFlow>
    </div>
  );
}

export default BipartiteGraph;
