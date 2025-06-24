import {
    ConnectionLineComponentProps,
    getStraightPath,
    useConnection,
} from "@xyflow/react";

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
    const connection = useConnection();

    return (
        <g>
            <path
                className="animated"
                style={{
                    ...connectionLineStyle,
                    stroke: connection.isValid
                        ? connectionLineStyle.stroke
                        : "red",
                }}
                fill="none"
                d={edgePath}
            />
        </g>
    );
}

export default CustomConnectionLine;
