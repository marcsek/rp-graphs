import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    predicateToggled,
    selectUnaryPreds,
    type GraphType,
} from "../../graphs/graphSlice";

export default function PredicateSelector({
    id,
    type,
}: {
    id: string;
    type: GraphType;
}) {
    const dispatch = useAppDispatch();
    const unaryPreds = useAppSelector(selectUnaryPreds);
    const selectedPreds = useAppSelector(
        (state) => state.graphState[id][type].selectedPreds,
    );

    return unaryPreds.map((pred) => (
        <label
            key={pred}
            //onMouseEnter={() => dispatch(predFocused(p.name))}
            //onMouseLeave={() => dispatch(predUnfocused())}
        >
            <input
                type="checkbox"
                checked={selectedPreds.includes(pred)}
                onChange={() =>
                    dispatch(predicateToggled({ id, type, predicate: pred }))
                }
            />
            {pred}
        </label>
    ));
}
