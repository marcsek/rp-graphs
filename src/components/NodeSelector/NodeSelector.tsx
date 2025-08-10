import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectedNodesChanged } from "../../graphs/graphSlice";
import type { GraphType } from "../../graphs/plugins";

export default function NodeSelector({
    id,
    type,
}: {
    id: string;
    type: GraphType;
}) {
    const dispatch = useAppDispatch();
    const domain = useAppSelector((state) => state.structure.domain);
    const selectedNodes = useAppSelector(
        (state) => state.graphState[id][type].selectedNodes,
    );

    return domain.map((element) => (
        <label key={element}>
            <input
                type="checkbox"
                checked={selectedNodes.includes(element)}
                onChange={() =>
                    dispatch(
                        selectedNodesChanged({
                            id,
                            type,
                            toggledNode: element,
                        }),
                    )
                }
            />
            {element}
        </label>
    ));
}
