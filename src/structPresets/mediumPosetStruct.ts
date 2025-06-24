import { Structure } from "./type";

const mediumPosetStruct: Structure = {
    domain: ["1", "2", "3", "4", "5", "6"],
    constants: {
        "1": ["Alex"],
        "2": ["Bruno"],
        "5": ["Hugo", "dad"],
        "6": ["Tina"],
    },
    mainPredicate: {
        name: "likes",
        interpretation: [
            ["1", "1"],
            ["1", "2"],
            ["1", "5"],
            ["1", "6"],
            ["2", "2"],
            ["3", "3"],
            ["3", "4"],
            ["4", "4"],
            ["5", "5"],
            ["5", "6"],
            ["6", "6"],
        ],
    },
    unaryPredicates: [
        { name: "woman", interpretation: ["1", "3", "4", "6"] },
        { name: "man", interpretation: ["2", "4"] },
    ],
};

export default mediumPosetStruct;
