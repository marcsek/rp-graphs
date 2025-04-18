import { NodeProps, Node } from "@xyflow/react";
import { memo } from "react";

const ButtonAddNode = memo(
  ({
    id,
    data,
  }: NodeProps<
    Node<{
      onAddNode: (adderId: string, type: "domain" | "range") => void;
      isFromDomain: boolean;
    }>
  >) => {
    return (
      <div
        className="customNode"
        onClick={() =>
          data.onAddNode(id, data.isFromDomain ? "domain" : "range")
        }
      >
        <div className="customNodeBody">
          <h1>+</h1>
        </div>
      </div>
    );
  },
);

export default ButtonAddNode;
