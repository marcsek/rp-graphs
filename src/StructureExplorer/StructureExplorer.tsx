import { useState } from "react";
import { useAppSelector } from "../app/hooks";
import "./StructureExplorer.css";

function StructureExplorer() {
    const [expanded, setExpanded] = useState(true);
    const domain = useAppSelector((state) => state.explorer.domain);
    const constants = useAppSelector((state) => state.explorer.constants);
    const mainPredicate = useAppSelector(
        (state) => state.explorer.mainPredicate,
    );
    const unaryPredicates = useAppSelector(
        (state) => state.explorer.unaryPredicates,
    );

    const constantsString = Object.keys(constants)
        .flatMap((key) => constants[key].map((value) => `(${value}, ${key})`))
        .join(", ");

    const mainPredString = mainPredicate.interpretation
        .map(([a, b]) => `(${a}, ${b})`)
        .join(", ");

    const constantNames = [...new Set(Object.values(constants))].join(", ");

    const predicateNames = unaryPredicates
        .map((p) => `${p.name}/1`)
        .concat(`${mainPredicate.name}/2`)
        .join(", ");

    return (
        <div className="topContainer">
            <div className="explorerContainer">
                {expanded ? (
                    <>
                        <div className="languageContainer">
                            <h3>Language</h3>
                            <div className="languageForm">
                                <span>
                                    𝓒<sub>𝓛</sub> = {`{ ${constantNames} }`}
                                </span>
                                <span>
                                    𝓟<sub>𝓛</sub> = {`{ ${predicateNames} }`}
                                </span>
                                <span>
                                    𝓕<sub>𝓛</sub> = {"{ }"}
                                </span>
                            </div>
                        </div>
                        <div className="divider" />
                        <div className="structureContainer">
                            <h3>Structure</h3>
                            <div className="structureForm">
                                <div className="other">
                                    <div className="input domain">
                                        <label htmlFor="input-domain">
                                            Domain
                                        </label>
                                        <input
                                            id="input-domain"
                                            type="text"
                                            value={domain.join(", ")}
                                        />
                                    </div>
                                    <div className="input constants">
                                        <label htmlFor="input-constants">
                                            Constants
                                        </label>
                                        <input
                                            id="input-constants"
                                            type="text"
                                            value={constantsString}
                                        />
                                    </div>
                                    <div className="input predicate">
                                        <label htmlFor="input-predicate">{`i(${mainPredicate.name})`}</label>
                                        <input
                                            id="input-predicate"
                                            type="text"
                                            value={mainPredString}
                                        />
                                    </div>
                                </div>
                                <div className="unary">
                                    {unaryPredicates.map((up) => (
                                        <div
                                            className="input unary"
                                            key={up.name}
                                        >
                                            <label htmlFor="input-unary-1">{`i(${up.name})`}</label>
                                            <input
                                                id="input-unary-1"
                                                type="text"
                                                value={up.interpretation.join(
                                                    ", ",
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                )}
                <button onClick={() => setExpanded((p) => !p)}>
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {expanded ? (
                            <path
                                d="M11.1464 6.85355C11.3417 7.04882 11.6583 7.04882 11.8536 6.85355C12.0488 6.65829 12.0488 6.34171 11.8536 6.14645L7.85355 2.14645C7.65829 1.95118 7.34171 1.95118 7.14645 2.14645L3.14645 6.14645C2.95118 6.34171 2.95118 6.65829 3.14645 6.85355C3.34171 7.04882 3.65829 7.04882 3.85355 6.85355L7.5 3.20711L11.1464 6.85355ZM11.1464 12.8536C11.3417 13.0488 11.6583 13.0488 11.8536 12.8536C12.0488 12.6583 12.0488 12.3417 11.8536 12.1464L7.85355 8.14645C7.65829 7.95118 7.34171 7.95118 7.14645 8.14645L3.14645 12.1464C2.95118 12.3417 2.95118 12.6583 3.14645 12.8536C3.34171 13.0488 3.65829 13.0488 3.85355 12.8536L7.5 9.20711L11.1464 12.8536Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            ></path>
                        ) : (
                            <path
                                d="M3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.14645 6.85355C7.34171 7.04882 7.65829 7.04882 7.85355 6.85355L11.8536 2.85355C12.0488 2.65829 12.0488 2.34171 11.8536 2.14645C11.6583 1.95118 11.3417 1.95118 11.1464 2.14645L7.5 5.79289L3.85355 2.14645ZM3.85355 8.14645C3.65829 7.95118 3.34171 7.95118 3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355L7.14645 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L11.8536 8.85355C12.0488 8.65829 12.0488 8.34171 11.8536 8.14645C11.6583 7.95118 11.3417 7.95118 11.1464 8.14645L7.5 11.7929L3.85355 8.14645Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            ></path>
                        )}
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default StructureExplorer;
