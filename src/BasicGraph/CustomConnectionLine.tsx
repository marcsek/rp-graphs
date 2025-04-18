import { ConnectionLineComponentProps, getStraightPath } from "@xyflow/react";

function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        className="animated"
        style={connectionLineStyle}
        fill="none"
        d={edgePath}
      />
    </g>
  );
}

export default CustomConnectionLine;
