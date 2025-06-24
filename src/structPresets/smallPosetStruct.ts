import { Structure } from "./type";

const smallPosetStruct: Structure = {
    domain: ["A", "B", "C", "D", "E"],
    constants: {
        A: ["Bob"],
        B: ["Alice"],
        C: ["Jack"],
        D: ["Mark"],
        E: ["Karen"],
    },
    mainPredicate: {
        name: "teaches",
        interpretation: [
            ["A", "A"],
            ["B", "B"],
            ["C", "C"],
            ["A", "B"],
            ["B", "C"],
            ["A", "C"],
        ],
    },
    unaryPredicates: [
        { name: "student", interpretation: ["A", "C"] },
        { name: "teacher", interpretation: ["A", "B", "C"] },
        { name: "janitor", interpretation: ["A", "B", "C", "D"] },
        { name: "principal", interpretation: ["E"] },
    ],
};

export default smallPosetStruct;
