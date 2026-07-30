/**
 * PDF Complete Guide → structured daily tasks + weekly checkpoints.
 * Source: Ayush_Panda_Complete_Guide_July2026_Dec2026.pdf §4 & §16
 */
const fs = require('fs');
const path = require('path');

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const weeksRaw = [
  { week: 1, theme: 'Arrays Logic Building + Resume Update', phase: 'M1', end: '2026-08-03', dsaTarget: 35,
    mustHave: ['Resume updated', '3 startups applied', 'Tracker setup'], redFlags: ['0 applications sent'],
    days: {
      'Wed Jul 29': 'Setup: Notion tracker, LeetCode profile, resume PDF. DSA: Intersection of two sorted arrays, Move Zeros to End, Remove duplicates from sorted array (3)',
      'Thu Jul 30': 'DSA: Find missing number, Union of two sorted arrays, Rearrange array elements by sign (3). Core CS: OS Ch1 — What is OS, Types',
      'Fri Jul 31': 'DSA: Leaders in an Array, Majority Element-I, Print the matrix in spiral manner (3). Apply: Better internship (deadline Aug 9)',
      'Sat Aug 1': "DSA: Pascal's Triangle I, Pascal's Triangle II, Pascal's Triangle III (3). Core CS: OS Ch2 — Process Management",
      'Sun Aug 2': 'REST DAY — Review week\'s problems, update portfolio README',
      'Mon Aug 3': 'DSA: Rotate matrix by 90 degrees, Two Sum, 3 Sum (3). Apply: GharPayy (deadline Aug 13), Singularium (Aug 15)',
    }},
  { week: 2, theme: 'Arrays FAQs Medium/Hard + Sorting', phase: 'M1', end: '2026-08-10', dsaTarget: 55,
    mustHave: ['Better/GharPayy applied', 'OS Ch1-2 done'], redFlags: ['Skipping DSA 3+ days'],
    days: {
      'Tue Aug 4': "DSA: 4 Sum, Kadane's Algorithm — Maximum Subarray Sum, Best Time to Buy and Sell Stock (3). Core CS: DBMS Ch1 — ER Model",
      'Wed Aug 5': 'DSA: Next Permutation, Majority Element-II, Find the repeating and missing number (3)',
      'Thu Aug 6': 'DSA: Count Inversions, Reverse Pairs, Merge two sorted arrays without extra space (3). Apply: BITCS (deadline Aug 14)',
      'Fri Aug 7': 'DSA: Selection Sort, Bubble Sort (2). Core CS: DBMS Ch2 — Normalization',
      'Sat Aug 8': 'Sorting: Insertion Sorting, Merge Sorting, Quick Sorting (3). Mock: 1 easy LC timed (25 min)',
      'Sun Aug 9': 'REST — Revise sorting algorithms on paper. Apply: Better internship LAST DAY',
      'Mon Aug 10': 'Binary Search Fundamentals: Search X in sorted array, Lower Bound, Upper Bound (3). LinkedIn profile optimization',
    }},
  { week: 3, theme: 'Binary Search Complete', phase: 'M1', end: '2026-08-17', dsaTarget: 75,
    mustHave: ['Binary Search templates locked'], redFlags: ['No BS practice'],
    days: {
      'Tue Aug 11': 'BS Logic Building: Search insert position, Floor and Ceil in Sorted Array, First and last occurrence (3). Core CS: OS Ch3 — Scheduling',
      'Wed Aug 12': 'BS Logic Building: Search in rotated sorted array-I, Search in rotated sorted array-II, Find minimum in Rotated Sorted Array (3)',
      'Thu Aug 13': 'BS Logic Building: Find out how many times the array is rotated, Single element in sorted array (2). Apply: GharPayy LAST DAY',
      'Fri Aug 14': 'BS On Answers: Find square root of a number, Find Nth root of a number, Find the smallest divisor, Koko eating bananas (4). Apply: BITCS LAST DAY',
      'Sat Aug 15': 'BS On Answers: Minimum days to make M bouquets, Aggressive Cows, Book Allocation Problem (3). Apply: Singularium LAST DAY',
      'Sun Aug 16': 'REST — Revise all BS templates (lower bound, on answers)',
      'Mon Aug 17': 'BS FAQs: Find peak element, Median of 2 sorted arrays, Kth element of 2 sorted arrays, Split array - largest sum (4)',
    }},
  { week: 4, theme: 'Hashing + Month 1 Review', phase: 'M1', end: '2026-08-24', dsaTarget: 127,
    mustHave: ['Mock #1 done', 'TCS NextStep registered'], redFlags: ['No mock interviews'],
    days: {
      'Tue Aug 18': "BS 2D Arrays: Find row with maximum 1's, Search in a 2D matrix, Search in 2D matrix - II (3). Core CS: CN Ch1 — OSI Model",
      'Wed Aug 19': 'BS 2D Arrays: Find Peak Element - II, Matrix Median (2). Hashing Theory (1)',
      'Thu Aug 20': 'Hashing FAQs: Longest Consecutive Sequence in an Array, Longest subarray with sum K, Count subarrays with given sum (3). Apply: Accredian (deadline Aug 19)',
      'Fri Aug 21': 'Hashing FAQs: Count subarrays with given xor K (1). Month 1 DSA catch-up (3 pending). Core CS: CN Ch2 — TCP/IP, HTTP',
      'Sat Aug 22': 'Mock Interview #1 (Pramp/Interviewing.io — startup level). Review weak topics',
      'Sun Aug 23': 'REST — Update Notion tracker. Count: should be ~140/480',
      'Mon Aug 24': 'Apply: Integral Solution (deadline Aug 24), Almanet (Aug 23). Month 1 audit',
    }},
  { week: 5, theme: 'Recursion — PatternWise', phase: 'M2', end: '2026-08-31', dsaTarget: 145,
    mustHave: ['Month 1 complete', '~35 companies eligible'], redFlags: ['Behind on recursion'],
    days: {
      'Tue Aug 25': 'Recursion: Pow(x,n), Generate Parentheses, Power Set (3). Core CS: OOP Ch1 — Classes',
      'Wed Aug 26': 'Recursion: Check if there exists a subsequence with sum K, Count all subsequences with sum K (2). Apply: Morfiction (deadline Aug 27)',
      'Thu Aug 27': 'Recursion: Combination Sum, Combination Sum II, Subsets I (3). Apply: DocStox (deadline Aug 27)',
      'Fri Aug 28': 'Recursion: Subsets II, Combination Sum III (2). Core CS: OOP Ch2 — Inheritance',
      'Sat Aug 29': 'PHASE 2 STARTS — Recursion: Letter Combinations of a Phone Number, Palindrome partitioning, Word Search (3). Mock #2 (service-based level)',
      'Sun Aug 30': 'REST — Month 1 complete! Eligible for ~35 companies now',
      'Mon Aug 31': 'Recursion Hard: N Queen, Rat in a Maze, M Coloring Problem, Sudoku Solver (4). TCS NQT registration check',
    }},
  { week: 6, theme: 'Linked List [Single LL, Doubly LL]', phase: 'M2', end: '2026-09-07', dsaTarget: 165,
    mustHave: ['LL fundamentals done'], redFlags: ['No Internshala applications'],
    days: {
      'Tue Sep 1': 'LL Fundamentals (SLL): Introduction to Singly LinkedList, Traversal in Linked List, Reverse a LL (3). Core CS: DBMS Ch3 — SQL Queries',
      'Wed Sep 2': 'LL: Remove Nth node from the back of the LL, Deletion of the Kth element of Linked List, Add two numbers in Linked List (3)',
      'Thu Sep 3': 'LL Doubly: Insertion in DLL, Deletion in Doubly LL (2). Apply: 5 more Internshala listings',
      'Fri Sep 4': 'LL FAQs Medium: Clone a LL with random and next pointer, Flattening of LL, Find the intersection point of Y LL (3). Core CS: OS Ch4 — Memory Mgmt',
      'Sat Sep 5': 'LL FAQs Hard: Reverse LL in group of given size K, LRU Cache (2). Mock #3',
      'Sun Sep 6': 'REST — Revise LL pointer techniques',
      'Mon Sep 7': 'Bit Manipulation: Single Number - I, Single Number - II, Single Number - III, Minimum Bit Flips to Convert Number (4)',
    }},
  { week: 7, theme: 'Bit Manipulation + Greedy', phase: 'M2', end: '2026-09-14', dsaTarget: 185,
    mustHave: ['~220/480 path'], redFlags: ['Burnout / skipped mocks'],
    days: {
      'Tue Sep 8': 'Bit Manipulation: Divide two numbers without multiplication and division, Power Set Bit Manipulation, XOR of numbers in a given range (3). Core CS: CN Ch3 — DNS, DHCP',
      'Wed Sep 9': 'Greedy Easy: Assign Cookies, Lemonade Change, Jump Game - I (3)',
      'Thu Sep 10': 'Greedy Intervals: Shortest Job First, Job sequencing Problem, N meetings in one room, Non-overlapping Intervals (4)',
      'Fri Sep 11': 'Greedy: Insert Interval, Minimum number of platforms required for a railway (2). Apply: Cognizant GenC check',
      'Sat Sep 12': 'Mock #4 (full startup interview — DSA + project discussion). Fix portfolio bugs',
      'Sun Sep 13': 'REST — Should be ~220/480. Review all patterns',
      'Mon Sep 14': 'Greedy Hard: Valid Paranthesis Checker, Candy (2). Wipro NLTH registration',
    }},
  { week: 8, theme: 'Sliding Window + Stack/Queue Start', phase: 'M2', end: '2026-09-21', dsaTarget: 230,
    mustHave: ['8 mocks', '25+ apps', 'CN basics'], redFlags: ['Less than 15 applications'],
    days: {
      'Tue Sep 15': 'Sliding Window: Longest Substring Without Repeating Characters, Maximum Points You Can Obtain from Cards, Fruit Into Baskets (3). Core CS: OOP Ch3 — Polymorphism',
      'Wed Sep 16': 'Sliding Window: Longest Substring With At Most K Distinct Characters, Max Consecutive Ones III (2). System Design: Intro (YouTube — Gaurav Sen)',
      'Thu Sep 17': 'Sliding Window: Minimum Window Substring, Number of Substrings Containing All Three Characters (2). Apply: TCS NQT if open',
      'Fri Sep 18': 'Stack Impl: Implement Stack using Arrays, Implement Stack using Queue, Implement Queue using Stack (3). Core CS: DBMS Ch4 — Indexing',
      'Sat Sep 19': 'Mock #5 + Mock #6 (2 mocks this week — interview ready push). Behavioral prep (STAR method)',
      'Sun Sep 20': 'REST — Should be ~250/480. INTERVIEW READY checkpoint!',
      'Mon Sep 21': 'Monotonic Stack: Next Greater Element, Next Greater Element - 2, Asteroid Collision (3). Start applying aggressively',
    }},
  { week: 9, theme: 'Stack/Queue + Binary Trees', phase: 'M2→M3', end: '2026-09-28', dsaTarget: 250,
    mustHave: ['Phase 2 complete', '60+ companies eligible'], redFlags: ['No tree practice'],
    days: {
      'Tue Sep 22': 'Monotonic Stack: Sum of Subarray Minimums, Remove K Digits (2). Apply: 10 companies this week',
      'Wed Sep 23': 'Stack FAQs: Implement Min Stack, Sum of Subarray Ranges, Trapping Rainwater (3)',
      'Thu Sep 24': 'BT Traversals: Preorder Traversal, Inorder Traversal, Postorder Traversal, Level Order Traversal (4). System Design: URL Shortener',
      'Fri Sep 25': 'BT Medium: Maximum Depth in BT, Diameter of Binary Tree, Check for balanced binary tree, Check for symmetrical BTs (4). Core CS: OS Ch5 — Deadlocks',
      'Sat Sep 26': 'Mock #7 (service-based: TCS/Wipro pattern). Mock #8 (startup technical)',
      'Sun Sep 27': 'REST — Phase 2 complete! Eligible for 60+ companies',
      'Mon Sep 28': 'BT Construction: Serialize and De-serialize BT, Construct a BT from Preorder and Inorder, Requirements needed to construct a unique BT (3). Amazon jobs alert setup',
    }},
  { week: 10, theme: 'Binary Trees Advanced + BST', phase: 'M3', end: '2026-10-05', dsaTarget: 270,
    mustHave: ['Microsoft applied'], redFlags: ['No FAANG apps'],
    days: {
      'Tue Sep 29': 'PHASE 3 STARTS — BT Hard: Maximum path sum, Construct a BT from Preorder and Inorder (2). SD: Rate Limiter',
      'Wed Sep 30': 'BST: Introduction to BST, Search in BST, Insert a given node in BST, Delete a node in BST (4). Apply: Microsoft SWE Intern (rolling)',
      'Thu Oct 1': 'BST Medium: Kth Smallest and Largest element in BST, LCA in BST, Floor and Ceil in a BST (3). Core CS: CN Ch4 — Routing',
      'Fri Oct 2': 'BST FAQs: BST iterator, Correct BST with two nodes swapped, Largest BST in Binary Tree (3)',
      'Sat Oct 3': 'Mock #9 (FAANG easy-medium). Amazon SDE intern — apply if posted. OA drill: 2 mediums timed 60 min (from FAANG OA Pack)',
      'Sun Oct 4': 'REST — Revise tree traversals + BST properties',
      'Mon Oct 5': 'Heaps: Heaps — Theory, Implement Min Heap, Implement Max Heap, Heapify Algorithm (4). SD: Notification System',
    }},
  { week: 11, theme: 'Heaps + Graphs BFS/DFS', phase: 'M3', end: '2026-10-12', dsaTarget: 290,
    mustHave: ['Graph templates', 'OA pack started'], redFlags: ['Skipping SD'],
    days: {
      'Tue Oct 6': 'Heaps: K-th Largest element in an array, Kth largest element in a stream of running integers, Heap Sort (3). Core CS: DBMS Ch5 — Transactions',
      'Wed Oct 7': 'Heaps: Build heap from a given Array, Check if an array represents a min heap, Convert Min Heap to Max Heap (3)',
      'Thu Oct 8': 'Graphs: Introduction to Graph, Traversal Techniques (BFS/DFS), Number of provinces, Rotten Oranges (4). Apply: Flipkart check',
      'Fri Oct 9': 'Graphs: Detect cycle in an undirected graph (BFS), Detect cycle in a directed graph (DFS), Topological Sort (BFS/DFS) (3). SD: Chat Application',
      'Sat Oct 10': 'Mock #10 (FAANG medium). OA drill: Product of Array Except Self + Top K Frequent + Merge Intervals (90 min timed)',
      'Sun Oct 11': 'REST — Should be ~340/480',
      'Mon Oct 12': "Graphs: Dijkstra's Algorithm, Bellman ford algorithm, Floyd warshall algorithm (3). Amazon OA practice",
    }},
  { week: 12, theme: 'Graphs Advanced + DP Start', phase: 'M3→M4', end: '2026-10-19', dsaTarget: 312,
    mustHave: ['Microsoft applied', 'Amazon alert', 'SD #3'], redFlags: ['No system design practice'],
    days: {
      'Tue Oct 13': "Graphs: MST theory, Disjoint Set (Union by rank/size + Path compression), Find the MST weight (Prim's/Kruskal's) (3)",
      'Wed Oct 14': 'Graphs: Word Ladder I, Word Ladder II, Bridges in graph (3). Core CS: OOP Ch4 — Design Patterns',
      'Thu Oct 15': 'DP 1D: Climbing stairs, House robber, Frog Jump, Frog jump with K distances (4). SD: Parking Lot',
      'Fri Oct 16': 'DP 1D: Maximum sum of non adjacent elements, Count partitions with given difference, Partition equal subset sum (3). Apply: Swiggy/Zomato',
      'Sat Oct 17': 'Mock #11 + Mock #12. OA drill: Word Break + Decode Ways + Jump Game II (90 min)',
      'Sun Oct 18': 'REST — Eligible for 75+ companies',
      'Mon Oct 19': 'PHASE 4 STARTS — DP on grids: Grid unique paths, Minimum Falling Path Sum, Triangle (3)',
    }},
  { week: 13, theme: 'DP 2D + Advanced', phase: 'M4', end: '2026-10-26', dsaTarget: 340,
    mustHave: ['DP patterns', 'OA pack P0 half done'], redFlags: ['DP avoidance'],
    days: {
      'Tue Oct 20': 'DP on strings: Longest common subsequence, Edit distance, Longest palindromic subsequence (3)',
      'Wed Oct 21': 'MCM DP: Matrix chain multiplication, Palindrome partitioning II, Minimum cost to cut the stick (3). SD: Instagram Feed',
      'Thu Oct 22': 'DP on subsequences: 0 and 1 Knapsack, Unbounded knapsack, Subset sum equals to target (3). Core CS: OS Ch6 — Virtual Memory',
      'Fri Oct 23': 'LIS: Longest String Chain, Number of Longest Increasing Subsequences (2). Apply: Razorpay, PhonePe',
      'Sat Oct 24': 'Mock #13 (FAANG hard DP). OA drill: Clone Graph + Pacific Atlantic + Network Delay Time (90 min)',
      'Sun Oct 25': 'REST — Should be ~400/480',
      'Mon Oct 26': 'Tries: Trie Implementation and Operations, Longest Word with All Prefixes, Maximum XOR of two numbers in an array (3). SD: YouTube/Twitter',
    }},
  { week: 14, theme: 'Tries + Strings + Maths', phase: 'M4', end: '2026-11-02', dsaTarget: 370,
    mustHave: ['Phase 4 complete', '85+ eligible'], redFlags: ['No FAANG follow-ups'],
    days: {
      'Tue Oct 27': 'Strings: KMP Algorithm or LPS array, Z function, Rabin Karp Algorithm (3). Core CS: DBMS Ch6 — ACID deep dive',
      'Wed Oct 28': 'Strings: Longest happy prefix, Shortest Palindrome (2). Apply: Google/other FAANG',
      'Thu Oct 29': 'Maths: Print all primes till N (Sieve of Eratosthenes), Modular Exponentiation (Fast/Binary Exponentiation) (2). SD: Uber/Lyft design',
      'Fri Oct 30': 'Maths: Prime factorisation of a Number, Count primes in range L to R, Modular Multiplicative Inverse (3). Mock #14',
      'Sat Oct 31': 'Mock #15 (full FAANG loop simulation). OA drill: Find Median from Data Stream + Task Scheduler + K Closest Points (90 min)',
      'Sun Nov 1': 'REST — Phase 4 complete! Eligible for 85+ companies',
      'Mon Nov 2': 'PHASE 5 STARTS — Revision: Re-do 10 marked hard problems. Behavioral: 8 STAR stories mapped to Amazon LPs',
    }},
  { week: 15, theme: 'Full Revision + Contests', phase: 'M5', end: '2026-11-09', dsaTarget: 400,
    mustHave: ['Revision batches', 'OA pack complete'], redFlags: ['Contest avoidance'],
    days: {
      'Tue Nov 3': 'Revision: Arrays + BS (re-do 5 hard). SD: Design WhatsApp',
      'Wed Nov 4': 'Revision: LL + Trees (re-do 5 hard). Core CS: Full OS revision',
      'Thu Nov 5': 'Revision: Graphs + Heaps (re-do 5 hard). Apply: Any remaining FAANG',
      'Fri Nov 6': 'Revision: DP (re-do 5 hard). Core CS: Full DBMS revision',
      'Sat Nov 7': 'Mock #16 + Mock #17 (back-to-back FAANG simulation). OA drill: random 3 from Gap Pack under 90 min',
      'Sun Nov 8': 'REST — Should be ~450/480',
      'Mon Nov 9': 'Contest: TUF contest or LC weekly. Review contest mistakes',
    }},
  { week: 16, theme: 'Final Push + Advanced SD', phase: 'M5', end: '2026-11-16', dsaTarget: 480,
    mustHave: ['480/480', '20+ mocks', 'LLD Part 1', 'FAANG OA pack done'], redFlags: ['Less than 40 applications'],
    days: {
      'Tue Nov 10': 'Remaining problems batch 1 (10). SD: Design Google Maps',
      'Wed Nov 11': 'Remaining problems batch 2 (10). Core CS: Full CN revision',
      'Thu Nov 12': 'Remaining problems batch 3 (10). Behavioral: 20 common FAANG questions',
      'Fri Nov 13': 'Remaining problems batch 4 (5). SD: Design Netflix',
      'Sat Nov 14': 'Mock #18 + Mock #19 + Mock #20 (triple mock day prep)',
      'Sun Nov 15': 'REST — 480/480 COMPLETE!',
      'Mon Nov 16': 'Full sheet revision: Random 10 problems timed',
    }},
  { week: 17, theme: 'FAANG Ready — Mock Marathon', phase: 'M5', end: '2026-11-23', dsaTarget: 480,
    mustHave: ['Mock marathon'], redFlags: ['No networking'],
    days: {
      'Tue Nov 17': 'Mock #21 (Google style). SD: Design Slack',
      'Wed Nov 18': 'Mock #22 (Amazon style). Core CS: Rapid fire quiz (100 Q)',
      'Thu Nov 19': 'Mock #23 (Microsoft style). Resume final polish',
      'Fri Nov 20': 'Mock #24 (Meta style). LinkedIn optimization',
      'Sat Nov 21': 'Mock #25 (Apple style). Offer negotiation prep',
      'Sun Nov 22': 'REST — Review all mock feedback',
      'Mon Nov 23': 'Apply: Any final openings. Network: 5 cold emails to engineers',
    }},
  { week: 18, theme: 'Offer Season + Maintenance', phase: 'M5', end: '2026-11-30', dsaTarget: 480,
    mustHave: ['1+ interview pipeline'], redFlags: ['No callbacks'],
    days: {
      'Tue Nov 24': 'Maintenance: 3 random problems/day. Follow up on applications',
      'Wed Nov 25': 'Maintenance: 3 problems. SD: Design Dropbox',
      'Thu Nov 26': 'Maintenance: 3 problems. Interview follow-ups',
      'Fri Nov 27': 'Maintenance: 3 problems. Offer comparison spreadsheet',
      'Sat Nov 28': 'Final Mock #26 — Full loop simulation',
      'Sun Nov 29': 'REST — CELEBRATE! FAANG READY',
      'Mon Nov 30': 'Plan next semester. Document learnings',
    }},
];

/** Plan now starts Thu Jul 30, 2026 (was Wed Jul 29). Shift all day labels + week ends by +1. */
const PLAN_SHIFT_DAYS = 1;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDayLabel(d) {
  return `${DOW[d.getUTCDay()]} ${MON_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function shiftIsoDate(iso, days) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function shiftWeeks(rawWeeks, days) {
  return rawWeeks.map((w) => {
    const newDays = {};
    for (const [label, plan] of Object.entries(w.days)) {
      const d = parseDayLabel(label);
      if (!d) {
        newDays[label] = plan;
        continue;
      }
      d.setUTCDate(d.getUTCDate() + days);
      newDays[formatDayLabel(d)] = plan;
    }
    return { ...w, end: shiftIsoDate(w.end, days), days: newDays };
  });
}

function parseDayLabel(label) {
  // "Wed Jul 29" or "Thu Oct 1"
  const m = label.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\w+)\s+(\d+)$/);
  if (!m) return null;
  const month = MONTHS[m[2]];
  const day = Number(m[3]);
  if (month == null) return null;
  // Year: Jul-Dec 2026
  return new Date(Date.UTC(2026, month, day));
}

const weeksShifted = shiftWeeks(weeksRaw, PLAN_SHIFT_DAYS);

/**
 * Rebuild daily DSA from unfinished TUF+ problems (skip status: Done).
 * Order: finish remaining Arrays (step 7) → catch up Basics/Sorting (steps 1–6) → rest of sheet.
 * Keeps Core CS / Apply / Mock / REST scaffolding from the weekly plan.
 */
function loadTodoQueue() {
  const problemsPath = path.join(__dirname, 'data', 'tuf-problems.json');
  const all = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));
  const todo = all
    .filter((p) => p.status !== 'Done')
    .sort((a, b) => a.sheetStep - b.sheetStep || a.orderInStep - b.orderInStep);

  const used = new Set();
  const take = (arr) => {
    const out = [];
    for (const p of arr) {
      const key = `${p.sheetStep}:${p.orderInStep}:${p.name}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push(p);
    }
    return out;
  };

  const arrays = take(todo.filter((p) => p.sheetStep === 7));
  const earlier = take(todo.filter((p) => p.sheetStep < 7));
  const sepCore = take(todo.filter((p) => p.sheetStep >= 8 && p.sheetStep <= 16));
  const oaPack = take(todo.filter((p) => p.topicName && /FAANG OA Gap Pack/i.test(p.topicName)));
  const faangDepth = take(todo.filter((p) => p.sheetStep >= 17 && p.sheetStep <= 23));
  const other = take(todo);

  const oaMid = Math.ceil(oaPack.length * 0.65);
  const oaFirst = oaPack.slice(0, oaMid);
  const oaRest = oaPack.slice(oaMid);

  // OA P0 classics early (Aug–Sep) so you are interview-armed before FAANG season;
  // remaining OA after Sep core + with FAANG depth topics.
  return {
    doneCount: all.filter((p) => p.status === 'Done').length,
    queue: [...arrays, ...earlier, ...oaFirst, ...sepCore, ...faangDepth, ...oaRest, ...other]
  };
}

function wantedProblemCount(raw) {
  const m = raw.match(/\((\d+)\)\s*(?:\.|$)/);
  if (m) return Math.min(6, Number(m[1]));
  if (/Mock|REST|Apply:\s*Integral|Month 1 audit|PHASE 5 STARTS — Revision|Contest:|Network:|CELEBRATE|Plan next/i.test(raw)
    && !/\bDSA:|Sorting:|BS |Hashing|Recursion|LL |Bit |Greedy|Sliding|Stack|Monotonic|BT |BST|Heaps|Graphs|DP |Tries|Strings:|Maths:|Remaining problems|Maintenance:/i.test(raw)) {
    return 0;
  }
  if (/Remaining problems batch/i.test(raw)) {
    const batch = raw.match(/batch \d+ \((\d+)\)/i);
    return batch ? Number(batch[1]) : 5;
  }
  if (/Revision:|Maintenance:/i.test(raw)) return 3;
  if (/Mock/i.test(raw) && !/DSA:|Sorting:|BS |Recursion|LL |Greedy|Sliding|Stack|BT |Heaps|Graphs|DP /i.test(raw)) return 0;
  return 3;
}

function keepSideTasks(raw) {
  const bits = [];
  const setup = raw.match(/Setup:\s*[^.]+/i);
  const core = raw.match(/Core CS:\s*[^.]+/i);
  const sd = raw.match(/(?:System Design|SD):\s*[^.]+/i);
  const apply = raw.match(/Apply:\s*[^.]+/i);
  const mock = raw.match(/Mock[^.]*/i);
  const behavioral = raw.match(/Behavioral:\s*[^.]+/i);
  const linkedin = raw.match(/LinkedIn[^.]*/i);
  const tcs = raw.match(/TCS NQT[^.]*/i);
  const phase = raw.match(/PHASE \d+ STARTS/i);
  const restNote = raw.match(/REST[^.!]*/i);
  if (setup) bits.push(setup[0].trim());
  if (phase) bits.push(phase[0].trim());
  if (core) bits.push(core[0].trim());
  if (sd) bits.push(sd[0].trim());
  if (apply) bits.push(apply[0].trim());
  else if (tcs) bits.push(tcs[0].trim());
  if (mock && !/^REST/i.test(raw)) bits.push(mock[0].trim());
  if (behavioral) bits.push(behavioral[0].trim());
  if (linkedin) bits.push(linkedin[0].trim());
  if (restNote && /^REST/i.test(raw)) bits.push(raw.trim());
  return bits;
}

function topicLabel(problems) {
  if (!problems.length) return null;
  const step = problems[0].sheetStep;
  const map = {
    1: 'Basic Maths', 2: 'Basic Arrays', 3: 'Basic Hashing', 4: 'Basic Strings', 5: 'Basic Recursion',
    6: 'Sorting', 7: 'Arrays', 8: 'Binary Search', 9: 'Hashing', 10: 'Recursion', 11: 'Linked List',
    12: 'Bit Manipulation', 13: 'Greedy', 14: 'Sliding Window', 15: 'Stack/Queues', 16: 'Binary Trees',
    17: 'BST', 18: 'Heaps', 19: 'Graphs', 20: 'DP', 21: 'Tries', 22: 'Strings Advanced', 23: 'Maths',
    24: 'FAANG OA Pack'
  };
  return map[step] || problems[0].topicName || 'DSA';
}

function injectProgressAwareDsa(shiftedWeeks) {
  const { doneCount, queue } = loadTodoQueue();
  let qi = 0;

  for (const w of shiftedWeeks) {
    const newDays = {};
    const assignedThisWeek = [];
    for (const [label, raw] of Object.entries(w.days)) {
      const isRest = /^REST/i.test(raw.trim());
      const n = isRest ? 0 : wantedProblemCount(raw);
      const take = [];
      for (let i = 0; i < n && qi < queue.length; i += 1) {
        take.push(queue[qi]);
        qi += 1;
      }
      assignedThisWeek.push(...take);

      const side = keepSideTasks(raw);
      const parts = [];
      if (take.length) {
        parts.push(`DSA (${topicLabel(take)}): ${take.map((p) => p.name).join(', ')} (${take.length})`);
      } else if (!isRest && qi >= queue.length && !/Mock|Apply|REST/i.test(raw)) {
        parts.push('DSA: Sheet complete — timed revision of 3 marked Hard/Revisit problems');
      }
      // Prefer Setup first if present
      const setupIdx = side.findIndex((s) => /^Setup:/i.test(s));
      if (setupIdx >= 0) {
        parts.unshift(side[setupIdx]);
        side.splice(setupIdx, 1);
      }
      parts.push(...side.filter((s) => !/^REST/i.test(s) || isRest));
      if (isRest && !parts.length) parts.push(raw.trim());

      newDays[label] = parts.join('. ').replace(/\s{2,}/g, ' ').trim();
    }
    w.days = newDays;
    if (assignedThisWeek.length) {
      const unique = [...new Set(assignedThisWeek.map((p) => topicLabel([p])))].filter(Boolean);
      w.theme = unique.length <= 2 ? `${unique.join(' + ')} (from your progress)` : `${unique[0]}+ (from your progress)`;
    }
  }

  let cumulative = doneCount;
  for (const w of shiftedWeeks) {
    let weekNew = 0;
    for (const dayRaw of Object.values(w.days)) {
      const m = dayRaw.match(/DSA \([^)]+\):\s*[^(]+\((\d+)\)/);
      if (m) weekNew += Number(m[1]);
    }
    cumulative = Math.min(480, cumulative + weekNew);
    if (w.week >= 16) cumulative = 480;
    w.dsaTarget = cumulative;
  }

  console.log(`Progress-aware DSA: skipped ${doneCount} Done; queued ${queue.length}; assigned ${qi}`);
  return shiftedWeeks;
}

const weeks = injectProgressAwareDsa(weeksShifted);

function extract(text, re) {
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function parsePlan(raw) {
  const isRest = /^REST/i.test(raw.trim());
  let dsaFocus =
    extract(raw, /DSA\s*\([^)]+\):\s*([^.]+)/i) ||
    extract(raw, /DSA:\s*([^.]+)/i) ||
    extract(raw, /(?:BS|Sorting|Hashing|2D|Recursion|LL|Bit|Greedy|SW|Stack|Monotonic|BT|BST|Heaps|Graphs|DP|Tries|Strings|Maths|Revision|Maintenance|Remaining problems)[^:]*:\s*([^.]+)/i) ||
    '';
  if (!dsaFocus && /Mock/i.test(raw)) dsaFocus = extract(raw, /(Mock[^.]*)/i);
  if (!dsaFocus && isRest) dsaFocus = 'Rest / light revision';

  const coreCS = extract(raw, /Core CS:\s*([^.]+)/i) || extract(raw, /SD:\s*([^.]+)/i) || extract(raw, /System Design:\s*([^.]+)/i) || '';
  const applicationTask = extract(raw, /Apply:\s*([^.]+)/i) || extract(raw, /(TCS NQT[^.]*)/i) || extract(raw, /(LinkedIn[^.]*)/i) || '';
  const techRevision = extract(raw, /Setup:\s*([^.]+)/i) || extract(raw, /Behavioral:\s*([^.]+)/i) || '';
  let englishTask = '';
  if (/Mock/i.test(raw)) englishTask = extract(raw, /(Mock[^.]*)/i) || 'Mock / explain-aloud practice';
  if (isRest) englishTask = englishTask || 'Light review only — protect energy';

  return {
    dsaFocus: dsaFocus || (isRest ? 'Rest day' : 'Follow PDF plan'),
    coreCS: coreCS || (isRest ? 'Optional review' : 'See PDF plan'),
    techRevision: techRevision || (coreCS.includes('SD') ? coreCS : 'Tech stack / portfolio touch'),
    applicationTask: applicationTask || (isRest ? 'No forced apps (rest)' : '1–3 companies if energy allows'),
    englishTask: englishTask || 'Explain 1 DSA solution out loud (2 min)',
    isRest,
    rawPlan: raw
  };
}

const dailyTasks = [];
const checkpoints = [];

for (const w of weeks) {
  let endDate = w.end;
  // Keep checkpoint dates out of December (buffer owns Dec)
  if (String(endDate).startsWith('2026-12')) endDate = '2026-11-30';
  checkpoints.push({
    weekNumber: w.week,
    date: endDate,
    dsaTarget: w.dsaTarget,
    dsaActual: 0,
    mustHaveDone: w.mustHave,
    redFlags: w.redFlags,
    onTrack: true,
    theme: w.theme,
    phase: w.phase
  });

  for (const [label, raw] of Object.entries(w.days)) {
    const date = parseDayLabel(label);
    if (!date) continue;
    // After Jul 30 shift, late W18 can spill into Dec — Dec buffer owns those days
    if (date.getUTCMonth() === 11) continue;
    const parsed = parsePlan(raw);
    dailyTasks.push({
      date: date.toISOString(),
      weekNumber: w.week,
      phase: w.phase,
      theme: w.theme,
      dayLabel: label,
      dsaProblems: [],
      dsaFocus: parsed.dsaFocus,
      coreCS: parsed.coreCS,
      techRevision: parsed.techRevision,
      applicationTask: parsed.applicationTask,
      englishTask: parsed.englishTask,
      isRest: parsed.isRest,
      rawPlan: parsed.rawPlan,
      completed: [],
      streakDay: dailyTasks.length + 1
    });
  }
}

// Dec buffer days (W19-20)
for (let d = 1; d <= 28; d++) {
  const date = new Date(Date.UTC(2026, 11, d));
  const early = d <= 14;
  dailyTasks.push({
    date: date.toISOString(),
    weekNumber: early ? 19 : 20,
    phase: 'M5',
    theme: 'Buffer + Continuous Improvement',
    dayLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    dsaProblems: [],
    dsaFocus: early ? '2 revision problems + 1 SD practice' : '1 timed problem + application follow-ups',
    coreCS: early ? 'System design practice' : 'Interview pipeline management',
    techRevision: 'Portfolio / resume polish',
    applicationTask: early ? 'Active interview pipeline management' : 'Target: 1+ offer in hand',
    englishTask: 'Behavioral STAR story practice',
    isRest: date.getUTCDay() === 0,
    rawPlan: early
      ? 'Daily: 2 revision problems + 1 SD practice. Active interview pipeline management'
      : 'Daily: 1 timed problem + application follow-ups. Target: 1+ offer in hand',
    completed: [],
    streakDay: dailyTasks.length + 1
  });
}

checkpoints.push(
  { weekNumber: 19, date: '2026-12-14', dsaTarget: 480, dsaActual: 0, mustHaveDone: ['1+ interview pipeline active', 'SD #10', 'FAANG OA pack done'], redFlags: ['No interview callbacks at all'], onTrack: true, theme: 'Buffer', phase: 'M5' },
  { weekNumber: 20, date: '2026-12-28', dsaTarget: 480, dsaActual: 0, mustHaveDone: ['Offer negotiation ready'], redFlags: ['Idle December'], onTrack: true, theme: 'Offer season', phase: 'M5' }
);

const dataDir = path.join(__dirname, 'data');
fs.writeFileSync(path.join(dataDir, 'daily-tasks.json'), JSON.stringify(dailyTasks, null, 2));
fs.writeFileSync(path.join(dataDir, 'checkpoints.json'), JSON.stringify(checkpoints, null, 2));
console.log(`Generated ${dailyTasks.length} daily tasks, ${checkpoints.length} checkpoints`);
module.exports = { dailyTasks, checkpoints };
