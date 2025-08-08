import "./graphComponents.css";
import "@xyflow/react/dist/style.css";

import {
    Handle,
    Position,
    useConnection,
    type Node,
    type NodeProps,
} from "@xyflow/react";

interface PredicateNodeData extends Record<string, unknown> {
    label: string;
}

// Omitting "domAttributes" is needed to prevent issues with immer library.
// It is never used anyway due to issues with serialization.
export type PredicateNodeType<
    NodeData extends Record<string, unknown> = Record<string, unknown>,
> = Omit<Node<PredicateNodeData & NodeData>, "domAttributes">;

export default function PredicateNode({
    id,
    data,
}: NodeProps<PredicateNodeType>) {
    const connection = useConnection();
    const isTarget = connection.inProgress && connection.fromNode.id !== id;

    return (
        <div>
            <div className="predicateNodeBody">
                {!connection.inProgress && (
                    <Handle
                        className="predicateNodeHandle"
                        position={Position.Right}
                        type="source"
                    />
                )}

                {(!connection.inProgress || isTarget) && (
                    <Handle
                        className="predicateNodeHandle"
                        position={Position.Left}
                        type="target"
                        isConnectableStart={false}
                    />
                )}
                {data.label}
            </div>
        </div>
    );
}
