import {
    BaseEdge,
    getStraightPath,
    useInternalNode,
    type Edge,
    type EdgeProps,
} from "@xyflow/react";
import { getEdgeParams } from "../../helpers/utils";

export type DirectEdgeType = Edge;

export default function DirectEdge({
    id,
    source: sourceId,
    target: targetId,
    markerEnd,
    style,
}: EdgeProps<DirectEdgeType>) {
    const source = useInternalNode(sourceId);
    const target = useInternalNode(targetId);

    if (!source || !target) return null;

    const { sx, sy, tx, ty } = getEdgeParams(source, target);

    const [path] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <BaseEdge
            id={id}
            className="react-flow__edge-path"
            path={path}
            markerEnd={markerEnd}
            style={style}
        />
    );
}
