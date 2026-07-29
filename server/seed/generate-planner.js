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

const weeks = [
  { week: 1, theme: 'Arrays Logic Building + Resume Update', phase: 'M1', end: '2026-08-03', dsaTarget: 38,
    mustHave: ['Resume updated', '3 startups applied', 'Tracker setup'], redFlags: ['0 applications sent'],
    days: {
      'Wed Jul 29': 'Setup: Notion tracker, LeetCode profile, resume PDF. DSA: Intersection of sorted arrays, Move zeros, Remove dupes (3)',
      'Thu Jul 30': 'DSA: Find missing number, Union arrays, Rearrange by sign (3). Core CS: OS Ch1 — What is OS, Types',
      'Fri Jul 31': 'DSA: Leaders in array, Majority Element-I, Print matrix spiral (3). Apply: Better internship (deadline Aug 9)',
      'Sat Aug 1': 'DSA: Rearrange array, Subarray sum equals K, Count subarrays sum K (3). Core CS: OS Ch2 — Process Management',
      'Sun Aug 2': 'REST DAY — Review week\'s problems, update portfolio README',
      'Mon Aug 3': 'DSA: Longest subarray sum K, 2Sum, 3Sum (3). Apply: GharPayy (deadline Aug 13), Singularium (Aug 15)',
    }},
  { week: 2, theme: 'Arrays FAQs Medium/Hard + Sorting', phase: 'M1', end: '2026-08-10', dsaTarget: 60,
    mustHave: ['Better/GharPayy applied', 'OS Ch1-2 done'], redFlags: ['Skipping DSA 3+ days'],
    days: {
      'Tue Aug 4': "DSA: Kadane's, Stock buy/sell, Container water (3). Core CS: DBMS Ch1 — ER Model",
      'Wed Aug 5': 'DSA: Trapping rain water, Max product subarray, Merge intervals (3)',
      'Thu Aug 6': 'DSA: Merge sorted arrays, Find repeating/missing, Count inversions (3). Apply: BITCS (deadline Aug 14)',
      'Fri Aug 7': 'DSA: Reverse pairs, Merge two sorted no extra space (2). Core CS: DBMS Ch2 — Normalization',
      'Sat Aug 8': 'Sorting: Bubble, Selection, Insertion, Merge sort (4). Mock: 1 easy LC timed (25 min)',
      'Sun Aug 9': 'REST — Revise sorting algorithms on paper. Apply: Better internship LAST DAY',
      'Mon Aug 10': 'Sorting: Quick sort, Count sort, Kth largest (3). LinkedIn profile optimization',
    }},
  { week: 3, theme: 'Binary Search Complete', phase: 'M1', end: '2026-08-17', dsaTarget: 82,
    mustHave: ['Binary Search templates locked'], redFlags: ['No BS practice'],
    days: {
      'Tue Aug 11': 'BS Fundamentals: Search X, Lower/Upper bound, Search insert (3). Core CS: OS Ch3 — Scheduling',
      'Wed Aug 12': 'BS Logic: Floor/Ceil, First/last occurrence, Rotated array-I (4)',
      'Thu Aug 13': 'BS Logic: Rotated array-II, Min in rotated, Times rotated (3). Apply: GharPayy LAST DAY',
      'Fri Aug 14': 'BS On Answers: Sqrt, Nth root, Smallest divisor, Koko bananas (4). Apply: BITCS LAST DAY',
      'Sat Aug 15': 'BS On Answers: Min days bouquets, Aggressive cows, Book allocation (3). Apply: Singularium LAST DAY',
      'Sun Aug 16': 'REST — Revise all BS templates (lower bound, on answers)',
      'Mon Aug 17': 'BS FAQs: Peak element, Median 2 arrays, Kth of 2 arrays, Split array (4)',
    }},
  { week: 4, theme: 'Hashing + Month 1 Review', phase: 'M1', end: '2026-08-24', dsaTarget: 138,
    mustHave: ['Mock #1 done', 'TCS NextStep registered'], redFlags: ['No mock interviews'],
    days: {
      'Tue Aug 18': 'Hashing Theory + Longest consecutive sequence, Subarray sum K (3). Core CS: CN Ch1 — OSI Model',
      'Wed Aug 19': 'Hashing: Count subarrays xor K, Longest substring no repeat (3)',
      'Thu Aug 20': 'Hashing FAQs: 4Sum, Count quadruplets, Subarray xor (3). Apply: Accredian (deadline Aug 19)',
      'Fri Aug 21': 'Month 1 DSA catch-up (4 pending). Core CS: CN Ch2 — TCP/IP, HTTP',
      'Sat Aug 22': 'Mock Interview #1 (Pramp/Interviewing.io — startup level). Review weak topics',
      'Sun Aug 23': 'REST — Update Notion tracker. Count: should be ~138/474',
      'Mon Aug 24': 'Apply: Integral Solution (deadline Aug 24), Almanet (Aug 23). Month 1 audit',
    }},
  { week: 5, theme: '2D Arrays + Recursion Start', phase: 'M2', end: '2026-08-31', dsaTarget: 158,
    mustHave: ['Month 1 complete', '~35 companies eligible'], redFlags: ['Behind on recursion'],
    days: {
      'Tue Aug 25': '2D: Row max 1s, Search 2D matrix-I/II, Find peak-II (4). Core CS: OOP Ch1 — Classes',
      'Wed Aug 26': '2D: Matrix median, Set matrix zeros, Rotate image (3). Apply: Morfiction (deadline Aug 27)',
      'Thu Aug 27': 'Recursion: Pow(x,n), Generate parentheses, Power set (3). Apply: DocStox (deadline Aug 27)',
      'Fri Aug 28': 'Recursion: Subsequence sum K — check/count (2). Core CS: OOP Ch2 — Inheritance',
      'Sat Aug 29': 'PHASE 2 STARTS — Recursion FAQs medium (3). Mock #2 (service-based level)',
      'Sun Aug 30': 'REST — Month 1 complete! Eligible for ~35 companies now',
      'Mon Aug 31': 'Recursion Hard: Sudoku, N-Queens, Rat in maze (3). TCS NQT registration check',
    }},
  { week: 6, theme: 'Recursion + Linked List', phase: 'M2', end: '2026-09-07', dsaTarget: 180,
    mustHave: ['LL fundamentals done'], redFlags: ['No Internshala applications'],
    days: {
      'Tue Sep 1': 'LL Fundamentals SLL: Reverse, Middle, Detect cycle (3). Core CS: DBMS Ch3 — SQL Queries',
      'Wed Sep 2': 'LL: Remove Nth node, Delete node, Add two numbers (3)',
      'Thu Sep 3': 'LL Doubly: Insert/delete, Reverse pairs (2). Apply: 5 more Internshala listings',
      'Fri Sep 4': 'LL FAQs Medium: Clone list, Flatten LL, Intersection (3). Core CS: OS Ch4 — Memory Mgmt',
      'Sat Sep 5': 'LL FAQs Hard: Reverse nodes k-group, LRU Cache design (2). Mock #3',
      'Sun Sep 6': 'REST — Revise LL pointer techniques',
      'Mon Sep 7': 'Bit Manipulation: Single number I/II/III, Missing/repeating (4)',
    }},
  { week: 7, theme: 'Bit Manipulation + Greedy', phase: 'M2', end: '2026-09-14', dsaTarget: 202,
    mustHave: ['~218/474 path'], redFlags: ['Burnout / skipped mocks'],
    days: {
      'Tue Sep 8': 'Bit: Power of 2, Count bits, Reverse bits, XOR queries (4). Core CS: CN Ch3 — DNS, DHCP',
      'Wed Sep 9': 'Greedy Easy: Assign cookies, Lemonade change, Jump game I (3)',
      'Thu Sep 10': 'Greedy Intervals: SJF, Job sequencing, N meetings, Non-overlap (4)',
      'Fri Sep 11': 'Greedy: Insert interval, Merge intervals, Min platforms (3). Apply: Cognizant GenC check',
      'Sat Sep 12': 'Mock #4 (full startup interview — DSA + project discussion). Fix portfolio bugs',
      'Sun Sep 13': 'REST — Should be ~218/474. Review all patterns',
      'Mon Sep 14': 'Greedy Advanced: Fractional knapsack, Huffman coding (2). Wipro NLTH registration',
    }},
  { week: 8, theme: 'Sliding Window + Stack/Queue Start', phase: 'M2', end: '2026-09-21', dsaTarget: 251,
    mustHave: ['8 mocks', '25+ apps', 'CN basics'], redFlags: ['Less than 15 applications'],
    days: {
      'Tue Sep 15': 'SW: Max sum subarray size K, First negative window, Count anagrams (3). Core CS: OOP Ch3 — Polymorphism',
      'Wed Sep 16': 'SW: Longest substring K distinct, Max consecutive ones-III (2). System Design: Intro (YouTube — Gaurav Sen)',
      'Thu Sep 17': 'SW: Min window substring, Subarray XOR K (2). Apply: TCS NQT if open',
      'Fri Sep 18': 'Stack Impl: Using arrays, Stack using queue, Queue using stack (3). Core CS: DBMS Ch4 — Indexing',
      'Sat Sep 19': 'Mock #5 + Mock #6 (2 mocks this week — interview ready push). Behavioral prep (STAR method)',
      'Sun Sep 20': 'REST — Should be ~251/474. INTERVIEW READY checkpoint!',
      'Mon Sep 21': 'Monotonic Stack: Next greater I/II, Asteroid collision (3). Start applying aggressively',
    }},
  { week: 9, theme: 'Stack/Queue + Binary Trees', phase: 'M2→M3', end: '2026-09-28', dsaTarget: 272,
    mustHave: ['Phase 2 complete', '60+ companies eligible'], redFlags: ['No tree practice'],
    days: {
      'Tue Sep 22': 'Monotonic: Sum subarray minimums, Remove K digits (2). Apply: 10 companies this week',
      'Wed Sep 23': 'Stack FAQs: Min stack, Evaluate expression, Next/smaller element (3)',
      'Thu Sep 24': 'BT Traversals: Pre/In/Post/Morris, Level order (4). System Design: URL Shortener',
      'Fri Sep 25': 'BT: Max depth, Diameter, Balanced check, LCA (4). Core CS: OS Ch5 — Deadlocks',
      'Sat Sep 26': 'Mock #7 (service-based: TCS/Wipro pattern). Mock #8 (startup technical)',
      'Sun Sep 27': 'REST — Phase 2 complete! Eligible for 60+ companies',
      'Mon Sep 28': 'BT Medium: Serialize, Flatten, Path sum I/II (4). Amazon jobs alert setup',
    }},
  { week: 10, theme: 'Binary Trees Advanced + BST', phase: 'M3', end: '2026-10-05', dsaTarget: 294,
    mustHave: ['Microsoft applied'], redFlags: ['No FAANG apps'],
    days: {
      'Tue Sep 29': 'PHASE 3 STARTS — BT Hard: Max path sum, Construct from traversals (2). SD: Rate Limiter',
      'Wed Sep 30': 'BST: Search, Insert, Delete, Validate BST (4). Apply: Microsoft SWE Intern (rolling)',
      'Thu Oct 1': 'BST Medium: Kth smallest, LCA in BST, Floor/ceil (3). Core CS: CN Ch4 — Routing',
      'Fri Oct 2': 'BST FAQs: Merge 2 BSTs, Recover BST, Largest BST subtree (3)',
      'Sat Oct 3': 'Mock #9 (FAANG easy-medium). Amazon SDE intern — apply if posted',
      'Sun Oct 4': 'REST — Revise tree traversals + BST properties',
      'Mon Oct 5': 'Heaps: Theory, Min/max heap impl, Heapify (3). SD: Notification System',
    }},
  { week: 11, theme: 'Heaps + Graphs BFS/DFS', phase: 'M3', end: '2026-10-12', dsaTarget: 316,
    mustHave: ['Graph templates'], redFlags: ['Skipping SD'],
    days: {
      'Tue Oct 6': 'Heaps: Kth largest, Kth smallest, Merge K sorted (3). Core CS: DBMS Ch5 — Transactions',
      'Wed Oct 7': 'Heaps: Task scheduler, Connect ropes, Find median stream (3)',
      'Thu Oct 8': 'Graphs: BFS/DFS intro, Number of provinces, Rotten oranges (3). Apply: Flipkart check',
      'Fri Oct 9': 'Graphs: Cycle detection (directed/undirected), Topo sort (3). SD: Chat Application',
      'Sat Oct 10': 'Mock #10 (FAANG medium). Review graph templates',
      'Sun Oct 11': 'REST — Should be ~340/474',
      'Mon Oct 12': 'Graphs: Dijkstra, Bellman-Ford, Floyd-Warshall (3). Amazon OA practice',
    }},
  { week: 12, theme: 'Graphs Advanced + DP Start', phase: 'M3→M4', end: '2026-10-19', dsaTarget: 340,
    mustHave: ['Microsoft applied', 'Amazon alert', 'SD #3'], redFlags: ['No system design practice'],
    days: {
      'Tue Oct 13': "Graphs: MST (Prim's/Kruskal's), Network delay, Cheapest flights (3)",
      'Wed Oct 14': 'Graphs: Word ladder, Word ladder-II, Bridges (3). Core CS: OOP Ch4 — Design Patterns',
      'Thu Oct 15': 'DP 1D: Climbing stairs, House robber I/II, Frog jump (4). SD: Parking Lot',
      'Fri Oct 16': 'DP 1D: Max sum non-adjacent, Count partitions, Partition equal (3). Apply: Swiggy/Zomato',
      'Sat Oct 17': 'Mock #11 + Mock #12. Phase 3 review',
      'Sun Oct 18': 'REST — Eligible for 75+ companies',
      'Mon Oct 19': 'PHASE 4 STARTS — DP 2D: Unique paths, Min path sum, Triangle (3)',
    }},
  { week: 13, theme: 'DP 2D + Advanced', phase: 'M4', end: '2026-10-26', dsaTarget: 370,
    mustHave: ['DP patterns'], redFlags: ['DP avoidance'],
    days: {
      'Tue Oct 20': 'DP 2D: Longest common subseq, Edit distance, Longest palindromic subseq (3)',
      'Wed Oct 21': 'DP 2D: Matrix chain, Palindrome partitioning, Max rectangle (3). SD: Instagram Feed',
      'Thu Oct 22': 'DP Advanced: Knapsack 0/1, Unbounded, Subset sum (3). Core CS: OS Ch6 — Virtual Memory',
      'Fri Oct 23': 'DP Advanced: Word break, Max profit job scheduling (2). Apply: Razorpay, PhonePe',
      'Sat Oct 24': 'Mock #13 (FAANG hard DP). Review DP patterns (5 categories)',
      'Sun Oct 25': 'REST — Should be ~403/474',
      'Mon Oct 26': 'Tries: Insert/search/delete, Longest word, Max XOR (3). SD: YouTube/Twitter',
    }},
  { week: 14, theme: 'Tries + Strings + Maths', phase: 'M4', end: '2026-11-02', dsaTarget: 403,
    mustHave: ['Phase 4 complete', '85+ eligible'], redFlags: ['No FAANG follow-ups'],
    days: {
      'Tue Oct 27': 'Strings: KMP, Z-algorithm, Rabin-Karp (3). Core CS: DBMS Ch6 — ACID deep dive',
      'Wed Oct 28': 'Strings: Longest happy prefix, Shortest palindrome (2). Apply: Google/other FAANG',
      'Thu Oct 29': 'Maths: Sieve, Modular arithmetic, Fast exponentiation (3). SD: Uber/Lyft design',
      'Fri Oct 30': 'Maths: GCD/LCM, Prime factorization, Count primes (3). Mock #14',
      'Sat Oct 31': 'Mock #15 (full FAANG loop simulation). Fix weak areas',
      'Sun Nov 1': 'REST — Phase 4 complete! Eligible for 85+ companies',
      'Mon Nov 2': 'PHASE 5 STARTS — Revision: Re-do 10 marked hard problems',
    }},
  { week: 15, theme: 'Full Revision + Contests', phase: 'M5', end: '2026-11-09', dsaTarget: 436,
    mustHave: ['Revision batches'], redFlags: ['Contest avoidance'],
    days: {
      'Tue Nov 3': 'Revision: Arrays + BS (re-do 5 hard). SD: Design WhatsApp',
      'Wed Nov 4': 'Revision: LL + Trees (re-do 5 hard). Core CS: Full OS revision',
      'Thu Nov 5': 'Revision: Graphs + Heaps (re-do 5 hard). Apply: Any remaining FAANG',
      'Fri Nov 6': 'Revision: DP (re-do 5 hard). Core CS: Full DBMS revision',
      'Sat Nov 7': 'Mock #16 + Mock #17 (back-to-back FAANG simulation)',
      'Sun Nov 8': 'REST — Should be ~447/474',
      'Mon Nov 9': 'Contest: TUF contest or LC weekly. Review contest mistakes',
    }},
  { week: 16, theme: 'Final Push + Advanced SD', phase: 'M5', end: '2026-11-16', dsaTarget: 474,
    mustHave: ['474/474', '20+ mocks', 'LLD Part 1'], redFlags: ['Less than 40 applications'],
    days: {
      'Tue Nov 10': 'Remaining problems batch 1 (10). SD: Design Google Maps',
      'Wed Nov 11': 'Remaining problems batch 2 (10). Core CS: Full CN revision',
      'Thu Nov 12': 'Remaining problems batch 3 (10). Behavioral: 20 common FAANG questions',
      'Fri Nov 13': 'Remaining problems batch 4 (11). SD: Design Netflix',
      'Sat Nov 14': 'Mock #18 + Mock #19 + Mock #20 (triple mock day prep)',
      'Sun Nov 15': 'REST — 474/474 COMPLETE!',
      'Mon Nov 16': 'Full sheet revision: Random 10 problems timed',
    }},
  { week: 17, theme: 'FAANG Ready — Mock Marathon', phase: 'M5', end: '2026-11-23', dsaTarget: 474,
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
  { week: 18, theme: 'Offer Season + Maintenance', phase: 'M5', end: '2026-11-30', dsaTarget: 474,
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

function extract(text, re) {
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function parsePlan(raw) {
  const isRest = /^REST/i.test(raw.trim());
  let dsaFocus =
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
  checkpoints.push({
    weekNumber: w.week,
    date: w.end,
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
  { weekNumber: 19, date: '2026-12-14', dsaTarget: 474, dsaActual: 0, mustHaveDone: ['1+ interview pipeline active', 'SD #10'], redFlags: ['No interview callbacks at all'], onTrack: true, theme: 'Buffer', phase: 'M5' },
  { weekNumber: 20, date: '2026-12-28', dsaTarget: 474, dsaActual: 0, mustHaveDone: ['Offer negotiation ready'], redFlags: ['Idle December'], onTrack: true, theme: 'Offer season', phase: 'M5' }
);

const dataDir = path.join(__dirname, 'data');
fs.writeFileSync(path.join(dataDir, 'daily-tasks.json'), JSON.stringify(dailyTasks, null, 2));
fs.writeFileSync(path.join(dataDir, 'checkpoints.json'), JSON.stringify(checkpoints, null, 2));
console.log(`Generated ${dailyTasks.length} daily tasks, ${checkpoints.length} checkpoints`);
module.exports = { dailyTasks, checkpoints };
