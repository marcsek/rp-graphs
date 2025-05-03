import {
  Handle,
  NodeProps,
  Position,
  useConnection,
  Node,
} from "@xyflow/react";
import { memo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { edgeAdded, newEdge, selectSelectedPreds } from "./basicGraphSlice";

const CustomNode = memo(({ id }: NodeProps<Node<{ label: string }>>) => {
  const connection = useConnection();
  const constants =
    useAppSelector((state) => state.explorer.constants[id]) ?? [];
  const mySelectedPredicates = useAppSelector((state) =>
    selectSelectedPreds(state, id),
  );
  const dispatch = useAppDispatch();

  const focusedPred = useAppSelector((state) => state.graph.focusedPred);
  const haveFocusedPred = mySelectedPredicates.some(
    (p) => p.name === focusedPred,
  );

  const isTarget = connection.inProgress;

  const createSelfEdge = () => {
    dispatch(
      newEdge({
        id: `e${id}-${id}`,
        source: id,
        target: id,
      }),
    );
  };

  return (
    <div className="customNodeWrapper" onDoubleClick={createSelfEdge}>
      <div className="predicatesContainer">
        {mySelectedPredicates.map((p) => (
          <div
            style={{
              backgroundColor: p.color,
              opacity:
                p.name === focusedPred || focusedPred === "" ? "100%" : "30%",
            }}
          ></div>
        ))}
      </div>
      <div
        className="customNode"
        style={{
          opacity: haveFocusedPred || focusedPred === "" ? "100%" : "30%",
        }}
      >
        <div className="customNodeBody">
          {!connection.inProgress && (
            <Handle
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
});

export default CustomNode;
