export function findRelatedPairs<T>(
    array: T[],
    relationFn: (a: T, b: T) => boolean,
) {
    const pairs = [];
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            if (relationFn(array[i], array[j])) {
                pairs.push([array[i], array[j]]);
            }
        }
    }

    return pairs;
}

export function getAllSubsets(arr) {
    const subsets = [[]];

    for (const element of arr) {
        const newSubsets = subsets.map((subset) => [...subset, element]);
        subsets.push(...newSubsets);
    }

    return subsets;
}

export function isSubset(setA: string[], setB: string[]) {
    return setA.every((e) => setB.includes(e));
}

export function isPoset(relations) {
    const elems = new Set();
    for (const [a, b] of relations) {
        elems.add(a);
        elems.add(b);
    }

    const succ = new Map();
    for (const [a, b] of relations) {
        if (!succ.has(a)) succ.set(a, new Set());
        succ.get(a).add(b);
    }

    // Ref.
    for (const x of elems) {
        if (!succ.get(x)?.has(x)) return false;
    }

    // Antisym.
    for (const [a, b] of relations) {
        if (a !== b && succ.get(b)?.has(a)) {
            return false;
        }
    }

    // Trans.
    for (const [a, b] of relations) {
        for (const c of succ.get(b) || []) {
            if (!succ.get(a)?.has(c)) {
                return false;
            }
        }
    }

    return true;
}

export function hasseEdges(relations) {
    const succ = new Map();
    for (const [a, b] of relations) {
        if (!succ.has(a)) succ.set(a, new Set());
        succ.get(a).add(b);
    }

    const edges = [];
    for (const [a, b] of relations) {
        if (a === b) continue;

        let covered = false;
        const nexts = succ.get(a) || new Set();
        for (const c of nexts) {
            if (c !== a && c !== b && (succ.get(c) || new Set()).has(b)) {
                covered = true;
                break;
            }
        }

        if (!covered) {
            edges.push([a, b]);
        }
    }

    return edges;
}

//export function hasseEdgesFullClosure(relations) {
//  // build adjacency list
//  const succ = new Map();
//  for (const [u, v] of relations) {
//    if (u === v) continue; // skip self‑loops early
//    if (!succ.has(u)) succ.set(u, new Set());
//    succ.get(u).add(v);
//  }
//
//  // compute reachable sets by a simple DFS from every node
//  const nodes = Array.from(new Set(relations.flat()));
//  const reachable = new Map();
//  for (const u of nodes) {
//    reachable.set(u, new Set());
//    (function dfs(cur) {
//      for (const w of succ.get(cur) || []) {
//        if (!reachable.get(u).has(w)) {
//          reachable.get(u).add(w);
//          dfs(w);
//        }
//      }
//    })(u);
//  }
//
//  // now filter: keep [u,v] iff there's no intermediate w
//  // with u→…→w and w→…→v
//  const edges = [];
//  for (const [u, v] of relations) {
//    if (u === v) continue;
//    let covered = false;
//    for (const w of reachable.get(u)) {
//      if (w === v) continue;
//      if (reachable.get(w).has(v)) {
//        covered = true;
//        break;
//      }
//    }
//    if (!covered) edges.push([u, v]);
//  }
//
//  return edges;
//}

//export function wouldBeInvalidHasseEdge(relations, [u, v]) {
//  // 1) no self‑loops
//  if (u === v) return true;
//
//  // 2) build succ‑map (drop any existing self‑loops)
//  const succ = new Map();
//  for (const [x, y] of relations) {
//    if (x === y) continue;
//    if (!succ.has(x)) succ.set(x, new Set());
//    succ.get(x).add(y);
//  }
//
//  // 3) no duplicate
//  if (succ.get(u)?.has(v)) return true;
//
//  // 4) gather all nodes (including u, v so we can detect cycles even if they’re new)
//  const nodes = new Set(relations.flat());
//  nodes.add(u);
//  nodes.add(v);
//
//  // 5) compute reachability via DFS
//  const reachable = new Map();
//  for (const n of nodes) {
//    reachable.set(n, new Set());
//    (function dfs(cur) {
//      for (const nxt of succ.get(cur) || []) {
//        if (!reachable.get(n).has(nxt)) {
//          reachable.get(n).add(nxt);
//          dfs(nxt);
//        }
//      }
//    })(n);
//  }
//
//  // 6) no cycle: v must not already reach u
//  if (reachable.get(v).has(u)) return true;
//
//  // 7) no redundancy: u must not already reach v
//  if (reachable.get(u).has(v)) return true;
//
//  // otherwise it’s a valid, minimal (Hasse) edge
//  return false;
//}

export function isValidHasseWithEdge(hasseEdges, [u_new, v_new]) {
    const nodes = new Set();
    const succ = new Map();
    for (const [u, v] of hasseEdges) {
        nodes.add(u);
        nodes.add(v);
        if (!succ.has(u)) succ.set(u, new Set());
        succ.get(u).add(v);
    }

    if (succ.has(u_new) && succ.get(u_new).has(v_new)) {
        return false;
    }

    nodes.add(u_new);
    nodes.add(v_new);
    if (!succ.has(u_new)) succ.set(u_new, new Set());
    succ.get(u_new).add(v_new);

    for (const x of nodes) {
        if (!succ.has(x)) succ.set(x, new Set());
    }

    const color = new Map();
    for (const x of nodes) {
        color.set(x, 0);
    }
    const stack = [];
    for (const start of nodes) {
        if (color.get(start) !== 0) continue;
        stack.push([start, false]);
        while (stack.length) {
            const [u, done] = stack.pop();
            if (!done) {
                if (color.get(u) === 1) {
                    return false;
                }
                color.set(u, 1);
                stack.push([u, true]);
                for (const w of succ.get(u)) {
                    if (color.get(w) === 0) {
                        stack.push([w, false]);
                    } else if (color.get(w) === 1) {
                        return false;
                    }
                }
            } else {
                color.set(u, 2);
            }
        }
    }

    for (const [u, vs] of succ.entries()) {
        for (const v of vs) {
            for (const w of succ.get(u)) {
                if (w === v) continue;
                const seen = new Set([w]);
                const stack2 = [w];
                while (stack2.length) {
                    const x = stack2.pop();
                    if (x === v) {
                        return false;
                    }
                    for (const y of succ.get(x)) {
                        if (x === u && y === v) continue;
                        if (!seen.has(y)) {
                            seen.add(y);
                            stack2.push(y);
                        }
                    }
                }
            }
        }
    }

    return true;
}

export function hasseToRelation(hasseEdges) {
    const nodes = new Set<any>();
    const succ = new Map<any, Set<any>>();
    for (const [u, v] of hasseEdges) {
        nodes.add(u);
        nodes.add(v);
        if (!succ.has(u)) succ.set(u, new Set());
        succ.get(u)!.add(v);
    }
    for (const x of nodes) {
        if (!succ.has(x)) succ.set(x, new Set());
    }

    const relation: Array<[any, any]> = [];

    for (const start of nodes) {
        relation.push([start, start]);

        const seen = new Set<any>();
        const stack = [start];
        while (stack.length) {
            const cur = stack.pop()!;
            for (const nxt of succ.get(cur)!) {
                if (!seen.has(nxt)) {
                    seen.add(nxt);
                    relation.push([start, nxt]);
                    stack.push(nxt);
                }
            }
        }
    }

    return relation;
}
