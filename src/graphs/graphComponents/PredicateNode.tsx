import "./graphComponents.css";
import "@xyflow/react/dist/style.css";

import {
    Handle,
    Position,
    useConnection,
    type Node,
    type NodeProps,
} from "@xyflow/react";

export type PredicateNodeType = Node<{ label: string }>;

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
