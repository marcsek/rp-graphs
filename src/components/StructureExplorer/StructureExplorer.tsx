import "./StructureExplorer.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { domainChanged } from "./structureSlice";

export default function StructureExplorer() {
    const dispatch = useAppDispatch();

    const predicates = useAppSelector((state) =>
        Object.values(state.language.predicates)
            .map((pred) => `${pred.name}\\${pred.arity}`)
            .join(", "),
    );

    const constatns = useAppSelector((state) =>
        state.language.constants.join(", "),
    );

    const domain = useAppSelector((state) => state.structure.domain.join(", "));
    const iC = useAppSelector((state) =>
        Object.keys(state.structure.iC)
            .map((key) => `${key}:${state.structure.iC[key]}`)
            .join(", "),
    );
    const iP = useAppSelector((state) => state.structure.iP);

    return (
        <section className="container">
            <div className="sub-container">
                <div className="entry">
                    <p>Domain:</p>
                    <span>{domain}</span>
                </div>

                <div className="entry">
                    <p>Predicates:</p>
                    <span>{predicates}</span>
                </div>

                <div className="entry">
                    <p>Constants:</p>
                    <span>{constatns}</span>
                </div>
            </div>

            <div className="sub-container">
                <div className="entry">
                    <p>Constants Interpretation:</p>
                    <span>{iC}</span>
                </div>

                {Object.keys(iP).map((pred) => (
                    <div className="entry" key={pred}>
                        <p>{`${pred}:`}</p>
                        <span>
                            {iP[pred]
                                .map((x) => `(${x.join(", ")})`)
                                .join(", ")}
                        </span>
                    </div>
                ))}
            </div>
            <div>
                <button
                    onClick={() =>
                        dispatch(
                            domainChanged(
                                Array.from(
                                    {
                                        length:
                                            Math.floor(Math.random() * 5) + 1,
                                    },
                                    (_, i) => String.fromCharCode(97 + i),
                                ),
                            ),
                        )
                    }
                >
                    Random Domain
                </button>
            </div>
        </section>
    );
}
