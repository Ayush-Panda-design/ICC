/**
 * Compare a curated LC topic list against TUF+ sheet (tuf-problems.json).
 * Usage: node seed/check-lc-coverage.js
 */
const fs = require('fs');
const path = require('path');

const problems = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'tuf-problems.json'), 'utf-8')
);

const list = [
  {
    topic: 'Binary Search',
    items: [
      [704, 'Binary Search'],
      [875, 'Apple Harvest (Koko Eating Bananas)'],
      [33, 'Search in Rotated Sorted Array'],
      [153, 'Find Minimum in Rotated Sorted Array'],
      [74, 'Search a 2D Matrix'],
      [410, 'Split Array Largest Sum'],
      [378, 'Kth Smallest in a Sorted Matrix'],
      [1011, 'Minimum Shipping Capacity']
    ]
  },
  {
    topic: 'Two Pointers',
    items: [
      [167, 'Two Sum II'],
      [125, 'Valid Palindrome'],
      [15, '3Sum'],
      [11, 'Container With Most Water'],
      [611, 'Valid Triangle Number'],
      [283, 'Move Zeroes'],
      [75, 'Sort Colors'],
      [42, 'Trapping Rain Water']
    ]
  },
  {
    topic: 'Arrays & Hashing',
    items: [
      [1, 'Two Sum'],
      [217, 'Contains Duplicate'],
      [242, 'Valid Anagram'],
      [49, 'Group Anagrams'],
      [347, 'Top K Frequent Elements'],
      [238, 'Product of Array Except Self'],
      [128, 'Longest Consecutive Sequence'],
      [271, 'Encode and Decode Strings']
    ]
  },
  {
    topic: 'Sliding Window',
    items: [
      [2461, 'Max Sum of Distinct Subarrays, Size K'],
      [1423, 'Max Points From Cards'],
      [3, 'Longest Substring Without Repeats'],
      [424, 'Longest Repeating Character Replacement'],
      [76, 'Minimum Window Substring'],
      [567, 'Permutation in String'],
      [239, 'Sliding Window Maximum']
    ]
  },
  {
    topic: 'Stack',
    items: [
      [20, 'Valid Parentheses'],
      [394, 'Decode String'],
      [32, 'Longest Valid Parentheses'],
      [739, 'Daily Temperatures'],
      [84, 'Largest Rectangle in Histogram'],
      [155, 'Min Stack'],
      [150, 'Evaluate Reverse Polish Notation']
    ]
  },
  {
    topic: 'Linked List',
    items: [
      [206, 'Reverse Linked List'],
      [21, 'Merge Two Sorted Lists'],
      [2, 'Add Two Numbers'],
      [141, 'Linked List Cycle'],
      [234, 'Palindrome Linked List'],
      [19, 'Remove Nth Node From End'],
      [143, 'Reorder List'],
      [24, 'Swap Nodes in Pairs'],
      [146, 'LRU Cache']
    ]
  },
  {
    topic: 'Heap',
    items: [
      [215, 'Kth Largest Element in an Array'],
      [973, 'K Closest Points to Origin'],
      [658, 'Find K Closest Elements'],
      [23, 'Merge K Sorted Lists'],
      [295, 'Median from Data Stream'],
      [621, 'Task Scheduler']
    ]
  },
  {
    topic: 'Trees / DFS',
    items: [
      [104, 'Maximum Depth of Binary Tree'],
      [112, 'Path Sum'],
      [98, 'Validate Binary Search Tree'],
      [563, 'Binary Tree Tilt'],
      [543, 'Diameter of a Binary Tree'],
      [113, 'Path Sum II'],
      [687, 'Longest Univalue Path'],
      [226, 'Invert Binary Tree'],
      [100, 'Same Tree'],
      [236, 'Lowest Common Ancestor of a Binary Tree'],
      [124, 'Binary Tree Maximum Path Sum'],
      [297, 'Serialize and Deserialize Binary Tree']
    ]
  },
  {
    topic: 'Graphs (DFS)',
    items: [
      [133, 'Copy Graph (Clone Graph)'],
      [261, 'Graph Valid Tree'],
      [733, 'Flood Fill'],
      [200, 'Number of Islands'],
      [130, 'Surrounded Regions'],
      [417, 'Pacific Atlantic Water Flow']
    ]
  },
  {
    topic: 'Greedy',
    items: [
      [121, 'Best Time to Buy and Sell Stock'],
      [134, 'Gas Station'],
      [55, 'Jump Game'],
      [45, 'Jump Game II'],
      [763, 'Partition Labels']
    ]
  },
  {
    topic: 'Dynamic Programming',
    items: [
      [70, 'Climbing Stairs'],
      [null, 'Dice Combinations'],
      [53, 'Maximum Subarray'],
      [198, 'House Robber'],
      [322, 'Coin Change'],
      [1143, 'Longest Common Subsequence'],
      [72, 'Edit Distance'],
      [338, 'Counting Bits'],
      [91, 'Decode Ways'],
      [62, 'Unique Paths'],
      [221, 'Maximal Square'],
      [300, 'Longest Increasing Subsequence'],
      [139, 'Word Break'],
      [1235, 'Maximum Profit in Job Scheduling'],
      [256, 'Paint House'],
      [265, 'Paint House II']
    ]
  },
  {
    topic: 'Graphs (algorithms)',
    items: [
      [207, 'Course Schedule'],
      [210, 'Course Schedule II'],
      [743, 'Network Delay Time'],
      [787, 'Cheapest Flights Within K Stops'],
      [1631, 'Path With Minimum Effort'],
      [1334, 'Find the City With Fewest Reachable'],
      [323, 'Number of Connected Components'],
      [684, 'Redundant Connection'],
      [127, 'Word Ladder']
    ]
  },
  {
    topic: 'Backtracking',
    items: [
      [79, 'Word Search'],
      [78, 'Subsets'],
      [46, 'Permutations'],
      [17, 'Letter Combinations of a Phone Number'],
      [22, 'Generate Parentheses'],
      [39, 'Combination Sum'],
      [131, 'Palindrome Partitioning'],
      [51, 'N-Queens']
    ]
  },
  {
    topic: 'BFS',
    items: [
      [199, 'Rightmost Node (Binary Tree Right Side View)'],
      [103, 'Zigzag Level Order'],
      [662, 'Maximum Width of Binary Tree'],
      [1197, 'Minimum Knight Moves'],
      [994, 'Rotting Oranges'],
      [542, '01 Matrix'],
      [815, 'Bus Routes'],
      [null, 'Level Order Sum']
    ]
  },
  {
    topic: 'Trie',
    items: [
      [208, 'Implement Trie Methods'],
      [null, 'Prefix Matching']
    ]
  },
  {
    topic: 'Prefix Sum',
    items: [
      [560, 'Subarray Sum Equals K'],
      [null, 'Count Vowels in Substrings']
    ]
  },
  {
    topic: 'Matrices',
    items: [
      [54, 'Spiral Matrix'],
      [48, 'Rotate Image'],
      [73, 'Set Matrix Zeroes']
    ]
  },
  {
    topic: 'Intervals',
    items: [
      [56, 'Merge Intervals'],
      [57, 'Insert Interval'],
      [435, 'Non-overlapping Intervals'],
      [252, 'Meeting Rooms'],
      [253, 'Meeting Rooms II']
    ]
  },
  {
    topic: 'Bit Manipulation',
    items: [
      [136, 'Single Number'],
      [191, 'Number of 1 Bits'],
      [268, 'Missing Number'],
      [190, 'Reverse Bits'],
      [371, 'Sum of Two Integers']
    ]
  }
];

const idToSlug = {
  1: 'two-sum',
  2: 'add-two-numbers',
  3: 'longest-substring-without-repeating-characters',
  11: 'container-with-most-water',
  15: '3sum',
  17: 'letter-combinations-of-a-phone-number',
  19: 'remove-nth-node-from-end-of-list',
  20: 'valid-parentheses',
  21: 'merge-two-sorted-lists',
  22: 'generate-parentheses',
  23: 'merge-k-sorted-lists',
  24: 'swap-nodes-in-pairs',
  32: 'longest-valid-parentheses',
  33: 'search-in-rotated-sorted-array',
  39: 'combination-sum',
  42: 'trapping-rain-water',
  45: 'jump-game-ii',
  46: 'permutations',
  48: 'rotate-image',
  49: 'group-anagrams',
  51: 'n-queens',
  53: 'maximum-subarray',
  54: 'spiral-matrix',
  55: 'jump-game',
  56: 'merge-intervals',
  57: 'insert-interval',
  62: 'unique-paths',
  70: 'climbing-stairs',
  72: 'edit-distance',
  73: 'set-matrix-zeroes',
  74: 'search-a-2d-matrix',
  75: 'sort-colors',
  76: 'minimum-window-substring',
  78: 'subsets',
  79: 'word-search',
  84: 'largest-rectangle-in-histogram',
  91: 'decode-ways',
  98: 'validate-binary-search-tree',
  100: 'same-tree',
  103: 'binary-tree-zigzag-level-order-traversal',
  104: 'maximum-depth-of-binary-tree',
  112: 'path-sum',
  113: 'path-sum-ii',
  121: 'best-time-to-buy-and-sell-stock',
  124: 'binary-tree-maximum-path-sum',
  125: 'valid-palindrome',
  127: 'word-ladder',
  128: 'longest-consecutive-sequence',
  130: 'surrounded-regions',
  131: 'palindrome-partitioning',
  133: 'clone-graph',
  134: 'gas-station',
  136: 'single-number',
  139: 'word-break',
  141: 'linked-list-cycle',
  143: 'reorder-list',
  146: 'lru-cache',
  150: 'evaluate-reverse-polish-notation',
  153: 'find-minimum-in-rotated-sorted-array',
  155: 'min-stack',
  167: 'two-sum-ii-input-array-is-sorted',
  190: 'reverse-bits',
  191: 'number-of-1-bits',
  198: 'house-robber',
  199: 'binary-tree-right-side-view',
  200: 'number-of-islands',
  206: 'reverse-linked-list',
  207: 'course-schedule',
  208: 'implement-trie-prefix-tree',
  210: 'course-schedule-ii',
  215: 'kth-largest-element-in-an-array',
  217: 'contains-duplicate',
  221: 'maximal-square',
  226: 'invert-binary-tree',
  234: 'palindrome-linked-list',
  236: 'lowest-common-ancestor-of-a-binary-tree',
  238: 'product-of-array-except-self',
  239: 'sliding-window-maximum',
  242: 'valid-anagram',
  252: 'meeting-rooms',
  253: 'meeting-rooms-ii',
  256: 'paint-house',
  261: 'graph-valid-tree',
  265: 'paint-house-ii',
  268: 'missing-number',
  271: 'encode-and-decode-strings',
  283: 'move-zeroes',
  295: 'find-median-from-data-stream',
  297: 'serialize-and-deserialize-binary-tree',
  300: 'longest-increasing-subsequence',
  322: 'coin-change',
  323: 'number-of-connected-components-in-an-undirected-graph',
  338: 'counting-bits',
  347: 'top-k-frequent-elements',
  371: 'sum-of-two-integers',
  378: 'kth-smallest-element-in-a-sorted-matrix',
  394: 'decode-string',
  410: 'split-array-largest-sum',
  417: 'pacific-atlantic-water-flow',
  424: 'longest-repeating-character-replacement',
  435: 'non-overlapping-intervals',
  542: '01-matrix',
  543: 'diameter-of-binary-tree',
  560: 'subarray-sum-equals-k',
  563: 'binary-tree-tilt',
  567: 'permutation-in-string',
  611: 'valid-triangle-number',
  621: 'task-scheduler',
  658: 'find-k-closest-elements',
  662: 'maximum-width-of-binary-tree',
  684: 'redundant-connection',
  687: 'longest-univalue-path',
  704: 'binary-search',
  733: 'flood-fill',
  739: 'daily-temperatures',
  743: 'network-delay-time',
  763: 'partition-labels',
  787: 'cheapest-flights-within-k-stops',
  815: 'bus-routes',
  875: 'koko-eating-bananas',
  973: 'k-closest-points-to-origin',
  994: 'rotting-oranges',
  1011: 'capacity-to-ship-packages-within-d-days',
  1143: 'longest-common-subsequence',
  1197: 'minimum-knight-moves',
  1235: 'maximum-profit-in-job-scheduling',
  1334: 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance',
  1423: 'maximum-points-you-can-obtain-from-cards',
  1631: 'path-with-minimum-effort',
  2461: 'maximum-sum-of-distinct-subarrays-with-length-k'
};

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const sheet = problems.map((p) => ({
  name: p.name,
  n: norm(p.name),
  url: p.url || '',
  topic: p.topicName,
  step: p.sheetStep
}));

function scoreMatch(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) {
    return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  }
  return 0;
}

function findInSheet(lcId, title) {
  const slug = lcId ? idToSlug[lcId] : null;
  if (slug) {
    const hit = sheet.find((p) => p.url && p.url.includes(`/problems/${slug}`));
    if (hit) return { how: 'url', ...hit };
  }

  const candidates = [
    norm(title),
    norm(title.replace(/\(.*?\)/g, ' ')),
    norm(title.replace(/Apple Harvest/i, 'koko eating bananas')),
    norm(title.replace(/Copy Graph.*/i, 'clone graph')),
    norm(title.replace(/Rightmost Node.*/i, 'binary tree right side view')),
    norm(title.replace(/Max Points From Cards/i, 'maximum points you can obtain from cards')),
    norm(title.replace(/Median from Data Stream/i, 'find median from data stream')),
    norm(title.replace(/Diameter of a Binary Tree/i, 'diameter of binary tree')),
    norm(title.replace(/Minimum Shipping Capacity/i, 'capacity to ship packages')),
    norm(title.replace(/Kth Smallest in a Sorted Matrix/i, 'kth smallest element in a sorted matrix')),
    norm(title.replace(/Split Array Largest Sum/i, 'split array largest sum')),
    norm(title.replace(/Longest Substring Without Repeats/i, 'longest substring without repeating')),
    norm(title.replace(/Implement Trie Methods/i, 'implement trie')),
    norm(title.replace(/Find the City With Fewest Reachable/i, 'find the city')),
    norm(title.replace(/Number of Connected Components/i, 'number of connected components')),
    norm(title.replace(/Max Sum of Distinct Subarrays.*/i, 'maximum sum of distinct subarrays')),
    norm(title.replace(/Zigzag Level Order/i, 'zigzag level order')),
    norm(title.replace(/Two Sum II/i, 'two sum ii')),
    slug ? norm(slug.replace(/-/g, ' ')) : ''
  ].filter(Boolean);

  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    for (const p of sheet) {
      const s = scoreMatch(p.n, c);
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    }
  }
  if (best && bestScore >= 0.62) return { how: `name(${bestScore.toFixed(2)})`, ...best };
  return null;
}

let present = 0;
let missing = 0;
let notOnLC = 0;
const missingRows = [];
const presentByTopic = [];

for (const sec of list) {
  let ok = 0;
  let miss = 0;
  const misses = [];
  for (const [id, title] of sec.items) {
    if (id == null) {
      notOnLC += 1;
      continue;
    }
    const hit = findInSheet(id, title);
    if (hit) {
      present += 1;
      ok += 1;
    } else {
      missing += 1;
      miss += 1;
      misses.push({ id, title, slug: idToSlug[id] || null });
      missingRows.push({ topic: sec.topic, id, title, slug: idToSlug[id] || null });
    }
  }
  presentByTopic.push({
    topic: sec.topic,
    present: ok,
    missing: miss,
    totalLC: ok + miss,
    misses
  });
}

const out = {
  sheetSize: problems.length,
  summary: {
    present,
    missing,
    notOnLCOrCustom: notOnLC,
    totalWithLCNumber: present + missing,
    coveragePct: Math.round((present / (present + missing)) * 100)
  },
  byTopic: presentByTopic,
  missingAll: missingRows
};

console.log(JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'lc-list-coverage.json'), JSON.stringify(out, null, 2));
