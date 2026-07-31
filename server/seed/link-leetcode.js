/**
 * Match TUF+ / OA problem names → LeetCode URLs when the problem exists on LC.
 * Run standalone: node seed/link-leetcode.js
 * Also called from ensurePrepContent (idempotent).
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const INDEX_PATH = path.join(DATA, 'leetcode-index.json');

const ALIASES = {
  'two sum': 'two-sum',
  '3 sum': '3sum',
  '4 sum': '4sum',
  '3sum': '3sum',
  '4sum': '4sum',
  "kadane's algorithm maximum subarray sum": 'maximum-subarray',
  'maximum subarray sum': 'maximum-subarray',
  'best time to buy and sell stock': 'best-time-to-buy-and-sell-stock',
  'best time to buy and sell stock single transaction': 'best-time-to-buy-and-sell-stock',
  'next permutation': 'next-permutation',
  'majority element i': 'majority-element',
  'majority element': 'majority-element',
  'majority element ii': 'majority-element-ii',
  'palindrome number': 'palindrome-number',
  'valid anagram': 'valid-anagram',
  'longest common prefix': 'longest-common-prefix',
  'isomorphic string': 'isomorphic-strings',
  'isomorphic strings': 'isomorphic-strings',
  'rotate string': 'rotate-string',
  'sort characters by frequency': 'sort-characters-by-frequency',
  'largest odd number in a string': 'largest-odd-number-in-string',
  'fibonacci number using recursion': 'fibonacci-number',
  'fibonacci number': 'fibonacci-number',
  'pow x n': 'powx-n',
  'generate parentheses': 'generate-parentheses',
  'power set': 'subsets',
  'combination sum': 'combination-sum',
  'combination sum ii': 'combination-sum-ii',
  'combination sum iii': 'combination-sum-iii',
  'subsets i': 'subsets',
  'subsets ii': 'subsets-ii',
  'letter combinations of a phone number': 'letter-combinations-of-a-phone-number',
  'palindrome partitioning': 'palindrome-partitioning',
  'word search': 'word-search',
  'n queen': 'n-queens',
  'n queens': 'n-queens',
  'sudoku solver': 'sudoku-solver',
  'reverse a ll': 'reverse-linked-list',
  'reverse linked list': 'reverse-linked-list',
  'lru cache': 'lru-cache',
  'trapping rainwater': 'trapping-rain-water',
  'trapping rain water': 'trapping-rain-water',
  'next greater element': 'next-greater-element-i',
  'next greater element 2': 'next-greater-element-ii',
  'asteroid collision': 'asteroid-collision',
  'implement min stack': 'min-stack',
  'climbing stairs': 'climbing-stairs',
  'house robber': 'house-robber',
  'house robber ii': 'house-robber-ii',
  'edit distance': 'edit-distance',
  'longest common subsequence': 'longest-common-subsequence',
  'word break': 'word-break',
  'decode ways': 'decode-ways',
  'jump game i': 'jump-game',
  'jump game ii': 'jump-game-ii',
  'clone graph': 'clone-graph',
  'course schedule': 'course-schedule',
  'number of islands': 'number-of-islands',
  'pacific atlantic water flow': 'pacific-atlantic-water-flow',
  'network delay time': 'network-delay-time',
  'cheapest flights within k stops': 'cheapest-flights-within-k-stops',
  'contains duplicate': 'contains-duplicate',
  'product of array except self': 'product-of-array-except-self',
  'group anagrams': 'group-anagrams',
  'top k frequent elements': 'top-k-frequent-elements',
  'container with most water': 'container-with-most-water',
  'merge intervals': 'merge-intervals',
  'meeting rooms ii': 'meeting-rooms-ii',
  'set matrix zeroes': 'set-matrix-zeroes',
  'permutation in string': 'permutation-in-string',
  'decode string': 'decode-string',
  'evaluate reverse polish notation': 'evaluate-reverse-polish-notation',
  'daily temperatures': 'daily-temperatures',
  'longest valid parentheses': 'longest-valid-parentheses',
  'reorder list': 'reorder-list',
  'swap nodes in pairs': 'swap-nodes-in-pairs',
  'invert binary tree': 'invert-binary-tree',
  'same tree': 'same-tree',
  'subtree of another tree': 'subtree-of-another-tree',
  'binary tree right side view': 'binary-tree-right-side-view',
  'number of connected components in an undirected graph': 'number-of-connected-components-in-an-undirected-graph',
  'redundant connection': 'redundant-connection',
  'graph valid tree': 'graph-valid-tree',
  'gas station': 'gas-station',
  'partition labels': 'partition-labels',
  'maximal square': 'maximal-square',
  'permutations': 'permutations',
  'find median from data stream': 'find-median-from-data-stream',
  'k closest points to origin': 'k-closest-points-to-origin',
  'task scheduler': 'task-scheduler',
  'number of 1 bits': 'number-of-1-bits',
  'counting bits': 'counting-bits',
  'reverse bits': 'reverse-bits',
  'sum of two integers': 'sum-of-two-integers',
  'min cost climbing stairs': 'min-cost-climbing-stairs',
  '01 matrix': '01-matrix',
  'word search ii': 'word-search-ii',
  'longest substring without repeating characters': 'longest-substring-without-repeating-characters',
  'minimum window substring': 'minimum-window-substring',
  'valid parentheses': 'valid-parentheses',
  'valid paranthesis checker': 'valid-parentheses',
  'search in rotated sorted array i': 'search-in-rotated-sorted-array',
  'search in rotated sorted array ii': 'search-in-rotated-sorted-array-ii',
  'find minimum in rotated sorted array': 'find-minimum-in-rotated-sorted-array',
  'koko eating bananas': 'koko-eating-bananas',
  'median of 2 sorted arrays': 'median-of-two-sorted-arrays',
  'longest consecutive sequence in an array': 'longest-consecutive-sequence',
  'longest consecutive sequence': 'longest-consecutive-sequence',
  'pascal s triangle i': 'pascals-triangle',
  "pascal's triangle i": 'pascals-triangle',
  "pascal's triangle": 'pascals-triangle',
  "pascal's triangle ii": 'pascals-triangle-ii',
  'rotate matrix by 90 degrees': 'rotate-image',
  'spiral matrix': 'spiral-matrix',
  'print the matrix in spiral manner': 'spiral-matrix',
  'set matrix zero': 'set-matrix-zeroes',
  'move zeros to end': 'move-zeroes',
  'move zeroes': 'move-zeroes',
  'remove duplicates from sorted array': 'remove-duplicates-from-sorted-array',
  'find missing number': 'missing-number',
  'missing number': 'missing-number',
  'leaders in an array': 'replace-elements-with-greatest-element-on-right-side', // closest classic; may miss
  'single number i': 'single-number',
  'single number ii': 'single-number-ii',
  'single number iii': 'single-number-iii',
  'assign cookies': 'assign-cookies',
  'lemonade change': 'lemonade-change',
  'jump game': 'jump-game',
  'non overlapping intervals': 'non-overlapping-intervals',
  'insert interval': 'insert-interval',
  'candy': 'candy',
  'diameter of binary tree': 'diameter-of-binary-tree',
  'maximum depth in bt': 'maximum-depth-of-binary-tree',
  'maximum depth of binary tree': 'maximum-depth-of-binary-tree',
  'serialize and de serialize bt': 'serialize-and-deserialize-binary-tree',
  'lowest common ancestor of a binary tree': 'lowest-common-ancestor-of-a-binary-tree',
  'lca in bst': 'lowest-common-ancestor-of-a-binary-search-tree',
  'search in bst': 'search-in-a-binary-search-tree',
  'validate binary search tree': 'validate-binary-search-tree',
  'kth smallest and largest element in bst': 'kth-smallest-element-in-a-bst',
  'implement stack using queues': 'implement-stack-using-queues',
  'implement queue using stacks': 'implement-queue-using-stacks',
  'implement stack using arrays': null, // not on LC as standalone
  'rotting oranges': 'rotting-oranges',
  'rotten oranges': 'rotting-oranges',
  'number of provinces': 'number-of-provinces',
  'course schedule i': 'course-schedule',
  'topological sort': 'course-schedule-ii',
  'word ladder i': 'word-ladder',
  'word ladder ii': 'word-ladder-ii',
  'unique paths': 'unique-paths',
  'grid unique paths': 'unique-paths',
  'minimum falling path sum': 'minimum-falling-path-sum',
  'triangle': 'triangle',
  '0 and 1 knapsack': null,
  'partition equal subset sum': 'partition-equal-subset-sum',
  'coin change': 'coin-change',
  'longest increasing subsequence': 'longest-increasing-subsequence',
  'house robber circular': 'house-robber-ii',
  'encode and decode strings': 'encode-and-decode-strings',
  'meeting rooms': 'meeting-rooms',
  'valid sudoku': 'valid-sudoku',
  'search a 2d matrix': 'search-a-2d-matrix',
  'search in a 2d matrix': 'search-a-2d-matrix',
  'search in 2d matrix ii': 'search-a-2d-matrix-ii',
  'find peak element': 'find-peak-element',
  'first and last occurrence': 'find-first-and-last-position-of-element-in-sorted-array',
  'search insert position': 'search-insert-position',
  'binary search': 'binary-search',
  'search x in sorted array': 'binary-search',
  'add two numbers in linked list': 'add-two-numbers',
  'remove nth node from the back of the ll': 'remove-nth-node-from-end-of-list',
  'find the intersection point of y ll': 'intersection-of-two-linked-lists',
  'linked list cycle': 'linked-list-cycle',
  'middle of the linked list': 'middle-of-the-linked-list',
  'merge two sorted lists': 'merge-two-sorted-lists',
  'flattening of ll': 'flatten-a-multilevel-doubly-linked-list',
  'clone a ll with random and next pointer': 'copy-list-with-random-pointer',
  'reverse ll in group of given size k': 'reverse-nodes-in-k-group',
  'fruit into baskets': 'fruit-into-baskets',
  'max consecutive ones iii': 'max-consecutive-ones-iii',
  'longest repeating character replacement': 'longest-repeating-character-replacement',
  'subarray sum equals k': 'subarray-sum-equals-k',
  'count subarrays with given sum': 'subarray-sum-equals-k',
  'longest subarray with sum k': 'maximum-size-subarray-sum-equals-k',
  'trapping rain water': 'trapping-rain-water',
  'remove k digits': 'remove-k-digits',
  'sum of subarray minimums': 'sum-of-subarray-minimums',
  'daily temperatures': 'daily-temperatures',
  'largest rectangle in histogram': 'largest-rectangle-in-histogram',
  'online stock span': 'online-stock-span',
  'basic calculator': 'basic-calculator',
  'evaluate reverse polish notation': 'evaluate-reverse-polish-notation',
  'design twitter': 'design-twitter',
  'time based key value store': 'time-based-key-value-store',
  'implement trie prefix tree': 'implement-trie-prefix-tree',
  'word search ii': 'word-search-ii',
  'maximum xor of two numbers in an array': 'maximum-xor-of-two-numbers-in-an-array',
  'kth largest element in an array': 'kth-largest-element-in-an-array',
  'k th largest element in an array': 'kth-largest-element-in-an-array',
  'top k frequent words': 'top-k-frequent-words',
  'merge k sorted lists': 'merge-k-sorted-lists',
  'find median from data stream': 'find-median-from-data-stream',
  'dijkstra s algorithm': 'network-delay-time',
  "dijkstra's algorithm": 'network-delay-time',
  'bellman ford algorithm': 'cheapest-flights-within-k-stops',
  'floyd warshall algorithm': 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance',
  'course schedule': 'course-schedule',
  'alien dictionary': 'alien-dictionary',
  'critical connections in a network': 'critical-connections-in-a-network',
  'bridges in graph': 'critical-connections-in-a-network',
  'number of islands': 'number-of-islands',
  'surrounded regions': 'surrounded-regions',
  'flood fill': 'flood-fill',
  '01 matrix': '01-matrix',
  'walls and gates': 'walls-and-gates',
  'open the lock': 'open-the-lock',
  'shortest path in binary matrix': 'shortest-path-in-binary-matrix',
  'path with minimum effort': 'path-with-minimum-effort',
  'cheapest flights within k stops': 'cheapest-flights-within-k-stops',
  'network delay time': 'network-delay-time',
  'swim in rising water': 'swim-in-rising-water',
  'min cost to connect all points': 'min-cost-to-connect-all-points',
  'redundant connection': 'redundant-connection',
  'accounts merge': 'accounts-merge',
  'number of provinces': 'number-of-provinces',
  'graph valid tree': 'graph-valid-tree',
  'number of connected components in an undirected graph': 'number-of-connected-components-in-an-undirected-graph',
  'climbing stairs': 'climbing-stairs',
  'min cost climbing stairs': 'min-cost-climbing-stairs',
  'house robber': 'house-robber',
  'house robber ii': 'house-robber-ii',
  'decode ways': 'decode-ways',
  'coin change': 'coin-change',
  'coin change ii': 'coin-change-ii',
  'target sum': 'target-sum',
  'partition equal subset sum': 'partition-equal-subset-sum',
  'longest increasing subsequence': 'longest-increasing-subsequence',
  'number of longest increasing subsequence': 'number-of-longest-increasing-subsequence',
  'longest string chain': 'longest-string-chain',
  'russian doll envelopes': 'russian-doll-envelopes',
  'maximum product subarray': 'maximum-product-subarray',
  'palindromic substrings': 'palindromic-substrings',
  'longest palindromic substring': 'longest-palindromic-substring',
  'longest palindromic subsequence': 'longest-palindromic-subsequence',
  'edit distance': 'edit-distance',
  'distinct subsequences': 'distinct-subsequences',
  'interleaving string': 'interleaving-string',
  'regex matching': 'regular-expression-matching',
  'wildcard matching': 'wildcard-matching',
  'unique paths': 'unique-paths',
  'unique paths ii': 'unique-paths-ii',
  'minimum path sum': 'minimum-path-sum',
  'dungeon game': 'dungeon-game',
  'maximal square': 'maximal-square',
  'longest common subsequence': 'longest-common-subsequence',
  'shortest common supersequence': 'shortest-common-supersequence',
  'burst balloons': 'burst-balloons',
  'palindrome partitioning ii': 'palindrome-partitioning-ii',
  'matrix chain multiplication': null,
  'word break ii': 'word-break-ii',
  'implement trie': 'implement-trie-prefix-tree',
  'design add and search words data structure': 'design-add-and-search-words-data-structure',
  'word search ii': 'word-search-ii',
  'maximum xor of two numbers in an array': 'maximum-xor-of-two-numbers-in-an-array',
  'count primes': 'count-primes',
  'pow x n': 'powx-n',
  'sqrt x': 'sqrtx',
  'find square root of a number': 'sqrtx',
  'excel sheet column title': 'excel-sheet-column-title',
  'roman to integer': 'roman-to-integer',
  'integer to roman': 'integer-to-roman',
  'string to integer atoi': 'string-to-integer-atoi',
  'valid number': 'valid-number',
  'plus one': 'plus-one',
  'add binary': 'add-binary',
  'multiply strings': 'multiply-strings',
  'pow of two': 'power-of-two',
  'power of two': 'power-of-two',
  'factorial trailing zeroes': 'factorial-trailing-zeroes',
  'happy number': 'happy-number',
  'ugly number': 'ugly-number',
  'super ugly number': 'super-ugly-number',
  'nth ugly number': 'ugly-number-ii',
  'fraction to recurring decimal': 'fraction-to-recurring-decimal',
  'max points on a line': 'max-points-on-a-line',
  'valid perfect square': 'valid-perfect-square',
  'arranging coins': 'arranging-coins',
  'bulb switcher': 'bulb-switcher',
  'nim game': 'nim-game',
  'water and jug problem': 'water-and-jug-problem',
  'integer break': 'integer-break',
  'perfect squares': 'perfect-squares',
  'largest number': 'largest-number',
  'create maximum number': 'create-maximum-number',
  'remove duplicate letters': 'remove-duplicate-letters',
  'basic calculator ii': 'basic-calculator-ii',
  'different ways to add parentheses': 'different-ways-to-add-parentheses',
  'expression add operators': 'expression-add-operators',
  'design circular queue': 'design-circular-queue',
  'design circular deque': 'design-circular-deque',
  'design hashset': 'design-hashset',
  'design hashmap': 'design-hashmap',
  'design linked list': 'design-linked-list',
  'flatten nested list iterator': 'flatten-nested-list-iterator',
  'peeking iterator': 'peeking-iterator',
  'zigzag iterator': 'zigzag-iterator',
  'moving average from data stream': 'moving-average-from-data-stream',
  'logger rate limiter': 'logger-rate-limiter',
  'design hit counter': 'design-hit-counter',
  'insert delete getrandom o 1': 'insert-delete-getrandom-o1',
  'lfu cache': 'lfu-cache',
  'all o one data structure': 'all-oone-data-structure',
  'first unique number': 'first-unique-number',
  'design underground system': 'design-underground-system',
  'snapshot array': 'snapshot-array',
  'range module': 'range-module',
  'my calendar i': 'my-calendar-i',
  'my calendar ii': 'my-calendar-ii',
  'my calendar iii': 'my-calendar-iii',
  'exam room': 'exam-room',
  'design a stack with increment operation': 'design-a-stack-with-increment-operation',
  'maximum frequency stack': 'maximum-frequency-stack'
};

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(using recursion|theory|introduction to|faqs?|hard|medium|easy|i+|part \d+)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyGuess(name) {
  return normalize(name).replace(/\s+/g, '-');
}

async function fetchLeetCodeIndex({ force = false } = {}) {
  if (!force && fs.existsSync(INDEX_PATH)) {
    try {
      const cached = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 1000) return cached;
    } catch {
      /* refetch */
    }
  }

  const res = await fetch('https://leetcode-api-pied.vercel.app/problems');
  if (!res.ok) throw new Error(`LeetCode index fetch failed: ${res.status}`);
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data.problems || [];
  const slim = arr.map((p) => ({
    title: p.title,
    title_slug: p.title_slug,
    url: p.url || `https://leetcode.com/problems/${p.title_slug}/`,
    difficulty: p.difficulty
  }));
  fs.writeFileSync(INDEX_PATH, JSON.stringify(slim, null, 2));
  return slim;
}

function buildLookup(index) {
  const byNorm = new Map();
  const bySlug = new Map();
  for (const p of index) {
    byNorm.set(normalize(p.title), p);
    bySlug.set(p.title_slug, p);
  }
  return { byNorm, bySlug };
}

function resolveLeetCode(name, lookup) {
  const n = normalize(name);
  if (!n) return null;

  if (Object.prototype.hasOwnProperty.call(ALIASES, n)) {
    const slug = ALIASES[n];
    if (!slug) return null;
    const hit = lookup.bySlug.get(slug);
    if (hit) return hit;
    return { title: name, title_slug: slug, url: `https://leetcode.com/problems/${slug}/` };
  }

  if (lookup.byNorm.has(n)) return lookup.byNorm.get(n);

  const guess = slugifyGuess(name);
  if (lookup.bySlug.has(guess)) return lookup.bySlug.get(guess);

  // Soft match: LC title contained in TUF name or vice versa (length guard)
  let best = null;
  let bestScore = 0;
  for (const [normTitle, p] of lookup.byNorm) {
    if (normTitle.length < 6) continue;
    if (n === normTitle) return p;
    if (n.includes(normTitle) || normTitle.includes(n)) {
      const score = Math.min(n.length, normTitle.length) / Math.max(n.length, normTitle.length);
      if (score > bestScore && score >= 0.72) {
        bestScore = score;
        best = p;
      }
    }
  }
  return best;
}

async function linkProblemsInDb() {
  const DSAProblem = require('../models/DSAProblem');
  const index = await fetchLeetCodeIndex();
  const lookup = buildLookup(index);
  const problems = await DSAProblem.find();
  let linked = 0;
  let cleared = 0;

  for (const p of problems) {
    const match = resolveLeetCode(p.name, lookup);
    const url = match?.url || null;
    if (url && p.url !== url) {
      p.url = url;
      await p.save();
      linked += 1;
    } else if (!url && p.url && /leetcode\.com\/problems\//i.test(p.url)) {
      // keep existing valid LC urls
    } else if (!url && p.url) {
      // leave non-LC urls alone
    }
  }

  // Also stamp urls onto seed JSON for future reseeds
  const seedPath = path.join(DATA, 'tuf-problems.json');
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    let seedLinked = 0;
    for (const row of seed) {
      const match = resolveLeetCode(row.name, lookup);
      if (match?.url) {
        if (row.url !== match.url) seedLinked += 1;
        row.url = match.url;
      }
    }
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
    cleared = seedLinked;
  }

  const withUrl = await DSAProblem.countDocuments({ url: /leetcode\.com\/problems\//i });
  return { linked, withUrl, total: problems.length, seedUpdated: cleared, indexSize: index.length };
}

module.exports = {
  fetchLeetCodeIndex,
  resolveLeetCode,
  linkProblemsInDb,
  normalize,
  ALIASES
};

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center';
  mongoose
    .connect(uri)
    .then(async () => {
      const r = await linkProblemsInDb();
      console.log('[leetcode]', r);
      await mongoose.disconnect();
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
