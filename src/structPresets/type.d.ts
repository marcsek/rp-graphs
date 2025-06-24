export interface Structure {
    domain: string[];
    constants: Record<string, string[]>;
    mainPredicate: BinaryPredicate;
    unaryPredicates: UnaryPredicate[];
}

export interface BinaryPredicate {
    name: string;
    interpretation: [string, string][];
}

export interface UnaryPredicate {
    name: string;
    interpretation: string[];
}
