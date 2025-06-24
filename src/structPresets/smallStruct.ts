import { Structure } from "./type";

const smallStruct: Structure = {
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
            ["A", "B"],
            ["A", "C"],
            ["A", "D"],
            ["C", "D"],
            ["E", "C"],
            ["E", "A"],
        ],
    },
    unaryPredicates: [
        { name: "student", interpretation: ["A", "C"] },
        { name: "teacher", interpretation: ["A", "B", "C"] },
        { name: "janitor", interpretation: ["A", "B", "C", "D"] },
        { name: "principal", interpretation: ["E"] },
    ],
};

export default smallStruct;
