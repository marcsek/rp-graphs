// import type { PredicateNodeType } from "../graphComponents/PredicateNode";
// import type { DirectEdgeType } from "../graphComponents/DirectEdge";
// import {
//     createSelector,
//     createSlice,
//     type PayloadAction,
// } from "@reduxjs/toolkit";
// import {
//     addEdge,
//     applyEdgeChanges,
//     applyNodeChanges,
//     type Connection,
//     type EdgeChange,
//     type NodeChange,
// } from "@xyflow/react";
// import type {
//     Language,
//     Structure,
// } from "../../components/StructureExplorer/structure.type";
// import type { AppThunk, RootState } from "../../app/store";
// import {
//     domainChanged,
//     predInterpretationChanged,
// } from "../../components/StructureExplorer/structureSlice";
// import {
//     expandReducedPoset,
//     isPoset,
//     reducePosetRelations,
//     type BinaryRelation,
// } from "./posetHelpers";
//
// export type HasseDiagramState = Record<
//     string,
//     {
//         nodes: PredicateNodeType[];
//         edges: DirectEdgeType[];
//         isPoset: boolean;
//     }
// >;
//
// const createNode = (id: string): PredicateNodeType => {
//     return {
//         id: id,
//         type: "predicate",
//         position: { x: 0, y: 0 },
//         data: { label: id },
//         //hidden: !iP.flat().includes(domElement),
//     };
// };
//
// const createEdge = (source: string, target: string): DirectEdgeType => {
//     return {
//         id: `eg-${source}->${target}`,
//         source,
//         target,
//     };
// };
//
// export const convertStructToHasseDiagram = (
//     struct: Structure,
//     lang: Language,
// ) => {
//     const graphs: HasseDiagramState = {};
//
//     const binaryPreds = Object.keys(lang.predicates).filter(
//         (pred) => lang.predicates[pred].arity === 2,
//     );
//
//     binaryPreds.forEach((binaryPred) => {
//         const iP = struct.iP[binaryPred] as BinaryRelation<string>;
//
//         graphs[binaryPred] = { nodes: [], edges: [], isPoset: true };
//
//         if (!isPoset(iP as [string, string][])) {
//             graphs[binaryPred].isPoset = false;
//             return;
//         }
//
//         struct.domain.forEach((domElement) => {
//             graphs[binaryPred].nodes.push(createNode(domElement));
//         });
//
//         const hasseEdges = reducePosetRelations(iP);
//         hasseEdges.forEach(([source, target]) => {
//             graphs[binaryPred].edges.push(createEdge(source, target));
//         });
//     });
//
//     return graphs;
// };
//
// export const convertPredicateToHasseDiagram = (
//     struct: Structure,
//     _: Language,
//     binaryPred: string,
// ) => {
//     const iP = struct.iP[binaryPred] as BinaryRelation<string>;
//
//     const graph: HasseDiagramState[string] = {
//         nodes: [],
//         edges: [],
//         isPoset: true,
//     };
//
//     if (!isPoset(iP as [string, string][])) {
//         graph.isPoset = false;
//         return graph;
//     }
//
//     struct.domain.forEach((domElement) => {
//         graph.nodes.push(createNode(domElement));
//     });
//
//     const hasseEdges = reducePosetRelations(iP);
//     hasseEdges.forEach(([source, target]) => {
//         graph.edges.push(createEdge(source, target));
//     });
//
//     return graph;
// };
//
// const initialState: HasseDiagramState = {};
//
// export const hasseDiagramSlice = createSlice({
//     name: "hasseDiagram",
//     initialState,
//     reducers: {
//         setStructure(
//             _,
//             action: PayloadAction<{ struct: Structure; lang: Language }>,
//         ) {
//             const { struct, lang } = action.payload;
//             return convertStructToHasseDiagram(struct, lang);
//         },
//
//         setNodes(
//             state,
//             action: PayloadAction<{ id: string; nodes: PredicateNodeType[] }>,
//         ) {
//             const { id, nodes } = action.payload;
//             state[id].nodes = nodes;
//         },
//
//         setEdges(
//             state,
//             action: PayloadAction<{ id: string; edges: DirectEdgeType[] }>,
//         ) {
//             const { id, edges } = action.payload;
//             state[id].edges = edges;
//         },
//
//         edgeAdded(
//             state,
//             action: PayloadAction<{ id: string; edge: DirectEdgeType }>,
//         ) {
//             const { id, edge } = action.payload;
//             state[id].edges = [...state[id].edges, edge];
//         },
//
//         onNodesChanged(
//             state,
//             action: PayloadAction<{
//                 id: string;
//                 changes: NodeChange<PredicateNodeType>[];
//             }>,
//         ) {
//             const { id, changes } = action.payload;
//             state[id].nodes = applyNodeChanges(changes, state[id].nodes);
//         },
//     },
//
//     extraReducers(builder) {
//         builder.addCase(domainChanged, (state, action) => {
//             for (const [id, graphState] of Object.entries(state)) {
//                 const nodes = [...graphState.nodes];
//                 const domain = action.payload;
//
//                 const newNodes = domain.map((element) => {
//                     const existingNode = nodes.find(
//                         (node) => node.id === element,
//                     );
//
//                     return existingNode
//                         ? { ...existingNode }
//                         : createNode(element);
//                 });
//
//                 state[id].nodes = newNodes;
//             }
//         });
//
//         builder.addCase(predInterpretationChanged, (state, action) => {
//             const { name, intr: newIP } = action.payload;
//
//             const reducedIP = reducePosetRelations(
//                 newIP as BinaryRelation<string>,
//             );
//
//             const newEdges = reducedIP.map(([source, target]) => {
//                 const id = `eg-${source}->${target}`;
//                 const existingEdge = state[name].edges.find(
//                     (edge) => edge.id === id,
//                 );
//
//                 return existingEdge
//                     ? { ...existingEdge }
//                     : { id, source, target };
//             });
//
//             state[name].edges = newEdges;
//         });
//     },
// });
//
// export const selectBinaryPreds = createSelector(
//     [(state: RootState) => state.language.predicates],
//     (preds) => Object.values(preds).filter((pred) => pred.arity === 2),
// );
//
// export const onEdgesChanged = ({
//     id,
//     changes,
// }: {
//     id: string;
//     changes: EdgeChange<DirectEdgeType>[];
// }): AppThunk => {
//     return (dispatch, getState) => {
//         const hasseDiagramState = getState().hasseDiagram;
//
//         const newEdges = applyEdgeChanges(changes, hasseDiagramState[id].edges);
//
//         const structFormat: BinaryRelation<string> = newEdges.map((edge) => [
//             edge.source,
//             edge.target,
//         ]);
//
//         const domain = new Set(getState().structure.domain);
//         const expandedEdges = expandReducedPoset(structFormat, domain);
//
//         console.log("Edges Changed");
//
//         dispatch(setEdges({ id, edges: newEdges }));
//         dispatch(predInterpretationChanged({ name: id, intr: expandedEdges }));
//     };
// };
//
// export const onConnected = ({
//     id,
//     connection,
// }: {
//     id: string;
//     connection: Connection;
// }): AppThunk => {
//     return (dispatch, getState) => {
//         const orientedGraphState = getState().hasseDiagram;
//
//         const newEdges = addEdge(connection, orientedGraphState[id].edges);
//
//         const structFormat: BinaryRelation<string> = newEdges.map((edge) => [
//             edge.source,
//             edge.target,
//         ]);
//
//         const domain = new Set(getState().structure.domain);
//         const expandedEdges = expandReducedPoset(structFormat, domain);
//
//         console.log("On Connected");
//
//         dispatch(predInterpretationChanged({ name: id, intr: expandedEdges }));
//     };
// };
//
// export const { setStructure, setNodes, setEdges, edgeAdded, onNodesChanged } =
//     hasseDiagramSlice.actions;
//
// export default hasseDiagramSlice.reducer;
