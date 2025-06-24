import {
    Handle,
    NodeProps,
    Position,
    Node,
    useConnection,
    useNodeConnections,
    HandleProps,
} from "@xyflow/react";
import { memo } from "react";

const BipartiteNode = memo(
    ({
        id,
        data,
    }: NodeProps<
        Node<{
            label: string;
            constant: string;
            isFromDomain: boolean;
        }>
    >) => {
        return (
            <div className="customNode">
                <div className="customNodeBody">
                    <h3>{data.label}</h3>
                    <p>{data.constant}</p>
                    <div style={{ display: "flex", gap: "2px" }} />
                </div>
                {data.isFromDomain ? (
                    <CustomHandle
                        type="source"
                        position={Position.Right}
                        connectionCount={1}
                        id={`${id}-d`}
                    />
                ) : (
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={`${id}-r`}
                    />
                )}
            </div>
        );
    },
);

const CustomHandle = ({
    connectionCount = Infinity,
    ...props
}: HandleProps & { connectionCount?: number }) => {
    const connections = useNodeConnections({
        handleType: props.type,
    });

    return (
        <Handle
            {...props}
            isConnectable={connections.length < connectionCount}
        />
    );
};

export default BipartiteNode;
