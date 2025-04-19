import {
  Handle,
  NodeProps,
  Position,
  useConnection,
  Node,
  useReactFlow,
} from "@xyflow/react";
import { memo } from "react";

const predCol = { student: "#FFAB00", teacher: "#22C55E", janitor: "#00B8D9" };

const CustomNode = memo(
  ({
    id,
    data,
  }: NodeProps<
    Node<{
      constant: string;
      predicate: string[];
      activePreds: Record<string, any>[];
      focusedPreds: Record<string, any>[];
    }>
  >) => {
    const connection = useConnection();
    const { getNodeConnections } = useReactFlow();
    console.log("conns", id, getNodeConnections({ nodeId: id }));
    const myActivePreds = data.activePreds.filter(
      (e) => data.predicate.includes(e.name) && e.active,
    );

    let myFocus = "default";
    const myFocusedPreds = data.focusedPreds.filter(
      (e) => data.predicate.includes(e.name) && e.focused,
    );

    const focusedPreds = data.focusedPreds.filter((e) => e.focused);
    if (myActivePreds.length != 0 && focusedPreds.length != 0)
      myFocus = "disabled";
    if (focusedPreds.length != 0 && myFocusedPreds.length != 0)
      myFocus = "focused";

    //console.log(connection);
    const isTarget = connection.inProgress;
    console.log(myFocus);

    return (
      <div className="customNodeWrapper">
        <div className="predicatesContainer">
          {myActivePreds.map((p) => (
            <div
              style={{
                backgroundColor: predCol[p.name],
                opacity:
                  myFocus !== "default" &&
                  !focusedPreds.find((pr) => pr.name === p.name)?.focused
                    ? "30%"
                    : "100%",
              }}
            ></div>
          ))}
        </div>
        <div
          className="customNode"
          style={{
            //border: "solid",
            //borderWidth: myFocus === "focused" ? "2px" : "0px",
            //borderColor:
            //  myFocus === "focused" ? predCol[myFocusedPreds[0].name] : "",
            opacity: myFocus === "disabled" ? "30%" : "100%",
          }}
        >
          <div className="customNodeBody">
            {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
            {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
            {!connection.inProgress && (
              <Handle
                className="customHandle"
                position={Position.Right}
                type="source"
              />
            )}
            {/* We want to disable the target handle, if the connection was started from this node */}
            {(!connection.inProgress || isTarget) && (
              <Handle
                className="customHandle"
                position={Position.Left}
                type="target"
                isConnectableStart={false}
              />
            )}
            <h3>{id}</h3>
            <p>{data.constant}</p>
          </div>
        </div>
      </div>
    );
  },
);

export default CustomNode;
