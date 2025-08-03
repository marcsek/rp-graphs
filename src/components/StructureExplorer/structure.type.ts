export interface Structure {
    domain: string[];

    iC: Record<string, string>;
    iP: Record<string, string[][]>;
}

export interface Language {
    constants: Constant[];
    predicates: Record<string, Predicate>;
}

export type Constant = string;
export interface Predicate {
    name: string;
    arity: number;
}
