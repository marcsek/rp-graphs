import {
    Handle,
    NodeProps,
    Position,
    useConnection,
    Node,
} from "@xyflow/react";
import { memo } from "react";
import { useAppSelector } from "../app/hooks";

const HasseNode = memo(
    ({ id, ...props }: NodeProps<Node<{ label: string }>>) => {
        const connection = useConnection();
        const constants = useAppSelector(
            (state) => state.explorer.constants[id],
        ) ?? [""];
        const isTarget = connection.inProgress;

        return (
            <div className="customNodeWrapper">
                <div className="customNode">
                    <div className="customNodeBody">
                        {!connection.inProgress && (
                            <Handle
                                style={{
                                    pointerEvents: props.selectable
                                        ? "auto"
                                        : "none",
                                }}
                                className="customHandle"
                                position={Position.Right}
                                type="source"
                            />
                        )}
                        {(!connection.inProgress || isTarget) && (
                            <Handle
                                className="customHandle"
                                position={Position.Left}
                                type="target"
                                isConnectableStart={false}
                            />
                        )}
                        <h3>{id}</h3>
                        <p>{constants.join(", ")}</p>
                    </div>
                </div>
            </div>
        );
    },
);

export default HasseNode;
