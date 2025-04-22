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
  const subsets = [[]]; // Start with the empty set

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
  // 1) Gather all elements
  const elems = new Set();
  for (const [a, b] of relations) {
    elems.add(a);
    elems.add(b);
  }

  // 2) Build successor map
  const succ = new Map();
  for (const [a, b] of relations) {
    if (!succ.has(a)) succ.set(a, new Set());
    succ.get(a).add(b);
  }

  // 3) Reflexivity: ∀x, (x, x) ∈ R
  for (const x of elems) {
    if (!succ.get(x)?.has(x)) return false;
  }

  // 4) Antisymmetry: ∀x≠y, if xRy and yRx ⇒ x === y
  for (const [a, b] of relations) {
    if (a !== b && succ.get(b)?.has(a)) {
      return false;
    }
  }

  // 5) Transitivity: ∀xRy ∧ yRz ⇒ xRz
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
  // Build a lookup Map so we can do constant-time checks for a→b
  const succ = new Map();
  for (const [a, b] of relations) {
    if (!succ.has(a)) succ.set(a, new Set());
    succ.get(a).add(b);
  }

  const edges = [];
  for (const [a, b] of relations) {
    // 1) ignore self‑loops
    if (a === b) continue;

    // 2) check if there's some intermediate c with a→c and c→b
    let covered = false;
    const nexts = succ.get(a) || new Set();
    for (const c of nexts) {
      if (c !== a && c !== b && (succ.get(c) || new Set()).has(b)) {
        covered = true;
        break;
      }
    }

    // if it's not “covered” by any other, it's a Hasse edge
    if (!covered) {
      edges.push([a, b]);
    }
  }

  return edges;
}

/**
 * Given a full relation (as an array of [u,v]), compute its Hasse edges
 * by removing any [u,v] for which there exists a third element w
 * so that u→…→w→…→v in one or more steps.
 */
export function hasseEdgesFullClosure(relations) {
  // build adjacency list
  const succ = new Map();
  for (const [u, v] of relations) {
    if (u === v) continue; // skip self‑loops early
    if (!succ.has(u)) succ.set(u, new Set());
    succ.get(u).add(v);
  }

  // compute reachable sets by a simple DFS from every node
  const nodes = Array.from(new Set(relations.flat()));
  const reachable = new Map();
  for (const u of nodes) {
    reachable.set(u, new Set());
    (function dfs(cur) {
      for (const w of succ.get(cur) || []) {
        if (!reachable.get(u).has(w)) {
          reachable.get(u).add(w);
          dfs(w);
        }
      }
    })(u);
  }

  // now filter: keep [u,v] iff there's no intermediate w
  // with u→…→w and w→…→v
  const edges = [];
  for (const [u, v] of relations) {
    if (u === v) continue;
    let covered = false;
    for (const w of reachable.get(u)) {
      if (w === v) continue;
      if (reachable.get(w).has(v)) {
        covered = true;
        break;
      }
    }
    if (!covered) edges.push([u, v]);
  }

  return edges;
}

/**
 * Given the full relation (as an array of [u,v]) and a candidate edge [u,v],
 * returns true if adding [u,v] should be disallowed because
 * 1) it's a self‑loop,
 * 2) it already exists,
 * 3) it would introduce a cycle (u is already above v),
 * 4) or it's redundant (covered by some w with u→…→w→…→v).
 *
 * @param {Array<[any, any]>} relations
 * @param {[any, any]} candidate
 * @returns {boolean}  true if [u,v] must NOT be added
 */
export function wouldBeInvalidHasseEdge(relations, [u, v]) {
  // 1) no self‑loops
  if (u === v) return true;

  // 2) build succ‑map (drop any existing self‑loops)
  const succ = new Map();
  for (const [x, y] of relations) {
    if (x === y) continue;
    if (!succ.has(x)) succ.set(x, new Set());
    succ.get(x).add(y);
  }

  // 3) no duplicate
  if (succ.get(u)?.has(v)) return true;

  // 4) gather all nodes (including u, v so we can detect cycles even if they’re new)
  const nodes = new Set(relations.flat());
  nodes.add(u);
  nodes.add(v);

  // 5) compute reachability via DFS
  const reachable = new Map();
  for (const n of nodes) {
    reachable.set(n, new Set());
    (function dfs(cur) {
      for (const nxt of succ.get(cur) || []) {
        if (!reachable.get(n).has(nxt)) {
          reachable.get(n).add(nxt);
          dfs(nxt);
        }
      }
    })(n);
  }

  // 6) no cycle: v must not already reach u
  if (reachable.get(v).has(u)) return true;

  // 7) no redundancy: u must not already reach v
  if (reachable.get(u).has(v)) return true;

  // otherwise it’s a valid, minimal (Hasse) edge
  return false;
}

/**
 * @param {Array<[any,any]>} hasseEdges  existing minimal cover edges
 * @param {[any,any]} newEdge            the candidate edge [u, v]
 * @returns {boolean}  true iff H ∪ {newEdge} is still a valid Hasse diagram
 */
export function isValidHasseWithEdge(hasseEdges, [u_new, v_new]) {
  // build node‑set & adjacency including the new edge
  const nodes = new Set();
  const succ = new Map();
  for (const [u, v] of hasseEdges) {
    nodes.add(u);
    nodes.add(v);
    if (!succ.has(u)) succ.set(u, new Set());
    succ.get(u).add(v);
  }

  // if the edge already exists, it's not valid
  if (succ.has(u_new) && succ.get(u_new).has(v_new)) {
    return false;
  }

  // add the candidate edge
  nodes.add(u_new);
  nodes.add(v_new);
  if (!succ.has(u_new)) succ.set(u_new, new Set());
  succ.get(u_new).add(v_new);

  // ensure every node appears in succ
  for (const x of nodes) {
    if (!succ.has(x)) succ.set(x, new Set());
  }

  // 1) cycle‑check via iterative DFS (coloring: 0=unvisited,1=visiting,2=done)
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
          // back-edge found
          return false;
        }
        color.set(u, 1);
        stack.push([u, true]);
        for (const w of succ.get(u)) {
          if (color.get(w) === 0) {
            stack.push([w, false]);
          } else if (color.get(w) === 1) {
            // cycle detected
            return false;
          }
        }
      } else {
        color.set(u, 2);
      }
    }
  }

  // 2) minimality: ensure no edge is implied by a longer path
  for (const [u, vs] of succ.entries()) {
    for (const v of vs) {
      for (const w of succ.get(u)) {
        if (w === v) continue;
        // check if v reachable from w without using edge u->v
        const seen = new Set([w]);
        const stack2 = [w];
        while (stack2.length) {
          const x = stack2.pop();
          if (x === v) {
            return false;
          }
          for (const y of succ.get(x)) {
            // skip the direct edge u->v
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

/**
 * Given a Hasse diagram (array of minimal edges [u,v]),
 * reconstruct the full poset relation by adding
 *  • reflexive loops (x,x) for every element x
 *  • all implied pairs via transitive closure
 *
 * @param {Array<[any, any]>} hasseEdges
 * @returns {Array<[any, any]>} the full relation R
 */
export function hasseToRelation(hasseEdges) {
  // 1) collect all nodes and build adjacency map
  const nodes = new Set<any>();
  const succ = new Map<any, Set<any>>();
  for (const [u, v] of hasseEdges) {
    nodes.add(u);
    nodes.add(v);
    if (!succ.has(u)) succ.set(u, new Set());
    succ.get(u)!.add(v);
  }
  // make sure every node appears in succ, even if with empty set
  for (const x of nodes) {
    if (!succ.has(x)) succ.set(x, new Set());
  }

  const relation: Array<[any, any]> = [];

  // 2) for each node, do a DFS to collect all reachable targets
  for (const start of nodes) {
    // reflexive
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
