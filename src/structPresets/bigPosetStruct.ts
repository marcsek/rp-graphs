import { Structure } from "./type";
import {
  findRelatedPairs,
  getAllSubsets,
  isSubset,
} from "../HasseDiagram/PosetHelper";

const subsets = getAllSubsets(["a", "b", "c", "d"]);
const relation = findRelatedPairs(subsets, isSubset);

const setToSring = (set: any[]) => `{ ${set.join(", ")} }`;
const domain = subsets.map(setToSring);
const interpretation: [string, string][] = relation.map(([a, b]) => [
  setToSring(a),
  setToSring(b),
]);

const bigPosetStruct: Structure = {
  domain,
  constants: {},
  mainPredicate: {
    name: "subset",
    interpretation,
  },
  unaryPredicates: [],
};

export default bigPosetStruct;
