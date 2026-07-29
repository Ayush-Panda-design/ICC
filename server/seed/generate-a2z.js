/**
 * Generate Striver A2Z sheet seed (~474) with PDF-aligned track/week tags.
 * Tracks: startup_service (Sep interview ready), faang (Oct–Dec), both
 */
const fs = require('fs');
const path = require('path');

const E = 'Easy';
const M = 'Medium';
const H = 'Hard';

function P(name, difficulty, track, targetWeek, targetPhase) {
  return { name, difficulty, track, targetWeek, targetPhase };
}

/** Pad list to exact count with descriptive titled variants (never "Problem N") */
function pad(list, count, stepLabel, defaultDiff, track, week, phase) {
  const out = [...list];
  let i = 1;
  while (out.length < count) {
    out.push(P(`${stepLabel} — Practice set ${i}`, defaultDiff, track, week, phase));
    i += 1;
  }
  return out.slice(0, count);
}

// ─── Step problem banks (real A2Z-style titles) ───
const basics = pad([
  P('User Input / Output', E, 'startup_service', 1, 1),
  P('Data Types', E, 'startup_service', 1, 1),
  P('If Else statements', E, 'startup_service', 1, 1),
  P('Switch Statement', E, 'startup_service', 1, 1),
  P('What are arrays, strings?', E, 'startup_service', 1, 1),
  P('For loops', E, 'startup_service', 1, 1),
  P('While loops', E, 'startup_service', 1, 1),
  P('Functions (Pass by Reference and Value)', E, 'startup_service', 1, 1),
  P('Time Complexity', E, 'startup_service', 1, 1),
  P('Space Complexity', E, 'startup_service', 1, 1),
  P('Patterns — Rectangular star', E, 'startup_service', 1, 1),
  P('Patterns — Right-angled triangle', E, 'startup_service', 1, 1),
  P('Patterns — Inverted right triangle', E, 'startup_service', 1, 1),
  P('Patterns — Pyramid', E, 'startup_service', 1, 1),
  P('Patterns — Diamond', E, 'startup_service', 1, 1),
  P('Patterns — Number crown', E, 'startup_service', 1, 1),
  P('Patterns — Binary number triangle', E, 'startup_service', 1, 1),
  P('Patterns — N-Forest', E, 'startup_service', 1, 1),
  P('Patterns — N-Triangle', E, 'startup_service', 1, 1),
  P('Patterns — Triangle', E, 'startup_service', 1, 1),
  P('Patterns — Number Triangle', E, 'startup_service', 1, 1),
  P('Patterns — Number Crown', E, 'startup_service', 1, 1),
  P('Patterns — Increasing Number Triangle', E, 'startup_service', 1, 1),
  P('Patterns — Star Diamond', E, 'startup_service', 1, 1),
  P('Patterns — Half Diamond', E, 'startup_service', 1, 1),
  P('Patterns — Alpha Ramp', E, 'startup_service', 1, 1),
  P('Patterns — Alpha Hill', E, 'startup_service', 1, 1),
  P('Patterns — Alpha Triangle', E, 'startup_service', 1, 1),
  P('Patterns — Symmetric Void', E, 'startup_service', 1, 1),
  P('Patterns — Symmetric Butterfly', E, 'startup_service', 1, 1),
  P('Patterns — Hollow Rectangle', E, 'startup_service', 1, 1),
  P('C++ STL — Vectors', E, 'startup_service', 1, 1),
  P('C++ STL — Pairs', E, 'startup_service', 1, 1),
  P('C++ STL — Maps / Unordered maps', E, 'startup_service', 1, 1),
  P('C++ STL — Sets / Multisets', E, 'startup_service', 1, 1),
  P('C++ STL — Stack / Queue / Priority Queue', E, 'startup_service', 1, 1),
  P('Java Collections overview', E, 'startup_service', 1, 1),
  P('Basic Maths — Count Digits', E, 'startup_service', 1, 1),
  P('Basic Maths — Reverse Number', E, 'startup_service', 1, 1),
  P('Basic Maths — Palindrome Number', E, 'startup_service', 1, 1),
  P('Basic Maths — GCD / HCF', E, 'startup_service', 1, 1),
  P('Basic Maths — Armstrong Number', E, 'startup_service', 1, 1),
  P('Basic Maths — Print all Divisors', E, 'startup_service', 1, 1),
  P('Basic Maths — Check Prime', E, 'startup_service', 1, 1),
  P('Recursion — Print Name N times', E, 'startup_service', 1, 1),
  P('Recursion — Print 1 to N', E, 'startup_service', 1, 1),
  P('Recursion — Print N to 1', E, 'startup_service', 1, 1),
  P('Recursion — Sum of first N', E, 'startup_service', 1, 1),
  P('Recursion — Factorial', E, 'startup_service', 1, 1),
  P('Recursion — Reverse Array', E, 'startup_service', 1, 1),
  P('Recursion — Check Palindrome', E, 'startup_service', 1, 1),
  P('Recursion — Fibonacci Number', E, 'startup_service', 1, 1),
  P('Hashing — Theory', E, 'startup_service', 1, 1),
  P('Hashing — Counting frequencies', E, 'startup_service', 1, 1),
], 54, 'Learn the basics', E, 'startup_service', 1, 1);

const sorting = pad([
  P('Selection Sort', E, 'startup_service', 2, 1),
  P('Bubble Sort', E, 'startup_service', 2, 1),
  P('Insertion Sort', E, 'startup_service', 2, 1),
  P('Merge Sort', M, 'startup_service', 2, 1),
  P('Recursive Bubble Sort', E, 'startup_service', 2, 1),
  P('Recursive Insertion Sort', E, 'startup_service', 2, 1),
  P('Quick Sort', M, 'startup_service', 2, 1),
], 7, 'Sorting', E, 'startup_service', 2, 1);

const arrays = pad([
  P('Largest Element in an Array', E, 'startup_service', 1, 1),
  P('Second Largest Element in an Array without sorting', E, 'startup_service', 1, 1),
  P('Check if the Array is Sorted', E, 'startup_service', 1, 1),
  P('Remove duplicates from Sorted array', E, 'startup_service', 1, 1),
  P('Left Rotate an array by one place', E, 'startup_service', 1, 1),
  P('Left rotate an array by D places', E, 'startup_service', 1, 1),
  P('Move Zeros to end', E, 'startup_service', 1, 1),
  P('Linear Search', E, 'startup_service', 1, 1),
  P('Find the Union', E, 'startup_service', 1, 1),
  P('Find missing number in an array', E, 'startup_service', 1, 1),
  P('Maximum Consecutive Ones', E, 'startup_service', 1, 1),
  P('Find the number that appears once', E, 'startup_service', 1, 1),
  P('Longest subarray with given sum K (positives)', M, 'startup_service', 1, 1),
  P('Longest subarray with sum K (Positives + Negatives)', M, 'startup_service', 1, 1),
  P('Two Sum', E, 'startup_service', 1, 1),
  P('Sort an array of 0s, 1s and 2s', M, 'startup_service', 1, 1),
  P('Majority Element (>n/2 times)', E, 'startup_service', 1, 1),
  P("Kadane's Algorithm — Maximum Subarray Sum", M, 'startup_service', 2, 1),
  P('Print the subarray with maximum sum', M, 'startup_service', 2, 1),
  P('Stock Buy and Sell', E, 'startup_service', 2, 1),
  P('Rearrange Array Elements by Sign', M, 'startup_service', 1, 1),
  P('Next Permutation', M, 'startup_service', 2, 1),
  P('Leaders in an Array', E, 'startup_service', 1, 1),
  P('Longest Consecutive Sequence in an Array', M, 'startup_service', 4, 1),
  P('Set Matrix Zeros', M, 'startup_service', 5, 2),
  P('Rotate Matrix by 90 degrees', M, 'startup_service', 5, 2),
  P('Spiral Traversal of a Matrix', M, 'startup_service', 1, 1),
  P('Count subarrays with given XOR', M, 'startup_service', 4, 1),
  P('Merge Overlapping Subintervals', M, 'startup_service', 2, 1),
  P('Merge two sorted arrays without extra space', M, 'startup_service', 2, 1),
  P('Find the repeating and missing number', M, 'startup_service', 2, 1),
  P('Count Inversions', H, 'faang', 2, 1),
  P('Reverse Pairs', H, 'faang', 2, 1),
  P('Maximum Product Subarray', M, 'startup_service', 2, 1),
  P('3Sum', M, 'startup_service', 1, 1),
  P('4Sum', M, 'startup_service', 4, 1),
  P('Largest Subarray with 0 Sum', M, 'startup_service', 4, 1),
  P('Count Subarrays with given sum', M, 'startup_service', 4, 1),
  P('Pascal\'s Triangle', M, 'startup_service', 5, 2),
  P('Majority Element II (>n/3)', M, 'startup_service', 2, 1),
], 40, 'Arrays', M, 'startup_service', 2, 1);

const binarySearch = pad([
  P('Binary Search to find X in sorted array', E, 'startup_service', 3, 1),
  P('Implement Lower Bound', E, 'startup_service', 3, 1),
  P('Implement Upper Bound', E, 'startup_service', 3, 1),
  P('Search Insert Position', E, 'startup_service', 3, 1),
  P('Floor/Ceil in Sorted Array', E, 'startup_service', 3, 1),
  P('Find first and last occurrence', M, 'startup_service', 3, 1),
  P('Count occurrences in sorted array', M, 'startup_service', 3, 1),
  P('Search in Rotated Sorted Array I', M, 'startup_service', 3, 1),
  P('Search in Rotated Sorted Array II', M, 'startup_service', 3, 1),
  P('Find Minimum in Rotated Sorted Array', M, 'startup_service', 3, 1),
  P('Find out how many times array is rotated', M, 'startup_service', 3, 1),
  P('Single Element in a Sorted Array', M, 'startup_service', 3, 1),
  P('Find Peak Element', M, 'startup_service', 3, 1),
  P('Find square root of a number', E, 'startup_service', 3, 1),
  P('Find Nth root of a number', M, 'startup_service', 3, 1),
  P('Koko Eating Bananas', M, 'startup_service', 3, 1),
  P('Minimum days to make M bouquets', M, 'startup_service', 3, 1),
  P('Find the smallest Divisor', M, 'startup_service', 3, 1),
  P('Capacity to Ship Packages within D Days', M, 'startup_service', 3, 1),
  P('Kth missing positive number', M, 'startup_service', 3, 1),
  P('Aggressive Cows', H, 'startup_service', 3, 1),
  P('Book Allocation Problem', H, 'startup_service', 3, 1),
  P('Split array — Largest Sum', H, 'startup_service', 3, 1),
  P('Painter\'s Partition', H, 'startup_service', 3, 1),
  P('Minimize Max Distance to Gas Station', H, 'faang', 3, 1),
  P('Median of two sorted arrays', H, 'faang', 3, 1),
  P('Kth element of two sorted arrays', M, 'startup_service', 3, 1),
  P('Row with max 1s', M, 'startup_service', 5, 2),
  P('Search in a 2D Matrix', M, 'startup_service', 5, 2),
  P('Search in a row and column wise sorted matrix', M, 'startup_service', 5, 2),
  P('Find Peak Element II (2D)', H, 'faang', 5, 2),
  P('Matrix Median', H, 'faang', 5, 2),
], 32, 'Binary Search', M, 'startup_service', 3, 1);

const stringsBasic = pad([
  P('Remove outermost Parentheses', E, 'startup_service', 4, 1),
  P('Reverse Words in a String', M, 'startup_service', 4, 1),
  P('Largest Odd Number in String', E, 'startup_service', 4, 1),
  P('Longest Common Prefix', E, 'startup_service', 4, 1),
  P('Isomorphic Strings', E, 'startup_service', 4, 1),
  P('Check whether one string is a rotation of another', E, 'startup_service', 4, 1),
  P('Check if two strings are anagrams', E, 'startup_service', 4, 1),
  P('Sort Characters by Frequency', M, 'startup_service', 4, 1),
  P('Maximum Nesting Depth of Parentheses', E, 'startup_service', 4, 1),
  P('Roman to Integer', E, 'startup_service', 4, 1),
  P('Implement Atoi', M, 'startup_service', 4, 1),
  P('Count Number of Substrings', M, 'startup_service', 4, 1),
  P('Longest Palindromic Substring', M, 'faang', 14, 4),
  P('Sum of Beauty of all Substrings', M, 'faang', 14, 4),
  P('Reverse Every Word in a String', M, 'startup_service', 4, 1),
], 15, 'Strings Basic', E, 'startup_service', 4, 1);

const linkedList = pad([
  P('Introduction to LinkedList — Array to LL', E, 'startup_service', 6, 2),
  P('Inserting a node in LinkedList', E, 'startup_service', 6, 2),
  P('Deleting a node in LinkedList', E, 'startup_service', 6, 2),
  P('Find the length of the LinkedList', E, 'startup_service', 6, 2),
  P('Search an element in LinkedList', E, 'startup_service', 6, 2),
  P('Middle of a LinkedList', E, 'startup_service', 6, 2),
  P('Reverse a LinkedList — Iterative', E, 'startup_service', 6, 2),
  P('Reverse a LinkedList — Recursive', M, 'startup_service', 6, 2),
  P('Detect a loop in LinkedList', M, 'startup_service', 6, 2),
  P('Find the starting point of loop', M, 'startup_service', 6, 2),
  P('Length of loop in LinkedList', M, 'startup_service', 6, 2),
  P('Check if LinkedList is Palindrome', M, 'startup_service', 6, 2),
  P('Segregate odd and even nodes', M, 'startup_service', 6, 2),
  P('Remove Nth node from end', M, 'startup_service', 6, 2),
  P('Delete the middle node', M, 'startup_service', 6, 2),
  P('Sort a LinkedList', M, 'startup_service', 6, 2),
  P('Sort a LL of 0s, 1s and 2s', M, 'startup_service', 6, 2),
  P('Find intersection of two LinkedLists', M, 'startup_service', 6, 2),
  P('Add two numbers represented as LL', M, 'startup_service', 6, 2),
  P('Delete all occurrences of a key in DLL', M, 'startup_service', 6, 2),
  P('Find pairs with given sum in DLL', M, 'startup_service', 6, 2),
  P('Remove duplicates from sorted DLL', M, 'startup_service', 6, 2),
  P('Reverse a DLL', E, 'startup_service', 6, 2),
  P('Introduction to Doubly LinkedList', E, 'startup_service', 6, 2),
  P('Insert in Doubly LinkedList', E, 'startup_service', 6, 2),
  P('Delete in Doubly LinkedList', E, 'startup_service', 6, 2),
  P('Reverse Nodes in K-Group', H, 'faang', 6, 2),
  P('Rotate a LinkedList', M, 'startup_service', 6, 2),
  P('Flattening a LinkedList', H, 'faang', 6, 2),
  P('Clone a LinkedList with random pointers', H, 'faang', 6, 2),
  P('Design Browser History (LL)', M, 'faang', 6, 2),
], 31, 'Linked List', M, 'startup_service', 6, 2);

const recursion = pad([
  P('Recursive Implementation of atoi', M, 'startup_service', 5, 2),
  P('Pow(x, n)', M, 'startup_service', 5, 2),
  P('Count Good Numbers', M, 'startup_service', 5, 2),
  P('Sort a stack using recursion', M, 'startup_service', 5, 2),
  P('Reverse a stack using recursion', M, 'startup_service', 5, 2),
  P('Generate Parentheses', M, 'startup_service', 5, 2),
  P('Generate all binary strings', M, 'startup_service', 5, 2),
  P('Print all subsequences / Power Set', M, 'startup_service', 5, 2),
  P('Learn All Patterns of Subsequences', M, 'startup_service', 5, 2),
  P('Count all subsequences with sum K', M, 'startup_service', 5, 2),
  P('Check if there exists a subsequence with sum K', M, 'startup_service', 5, 2),
  P('Combination Sum', M, 'startup_service', 5, 2),
  P('Combination Sum II', M, 'startup_service', 5, 2),
  P('Subset Sum', M, 'startup_service', 5, 2),
  P('Subset Sum II', M, 'startup_service', 5, 2),
  P('Combination Sum III', M, 'startup_service', 5, 2),
  P('Letter Combinations of a Phone Number', M, 'startup_service', 5, 2),
  P('Palindrome Partitioning', M, 'faang', 5, 2),
  P('Word Search', M, 'faang', 5, 2),
  P('N-Queens', H, 'faang', 5, 2),
  P('Rat in a Maze', H, 'startup_service', 5, 2),
  P('Word Break', M, 'faang', 5, 2),
  P('M Coloring Problem', H, 'faang', 5, 2),
  P('Sudoku Solver', H, 'faang', 5, 2),
  P('Expression Add Operators', H, 'faang', 5, 2),
], 25, 'Recursion', M, 'startup_service', 5, 2);

const bitManip = pad([
  P('Introduction to Bit Manipulation', E, 'startup_service', 7, 2),
  P('Check if i-th bit is set', E, 'startup_service', 7, 2),
  P('Check if a number is odd or not', E, 'startup_service', 7, 2),
  P('Check if a number is power of 2', E, 'startup_service', 7, 2),
  P('Count number of set bits', E, 'startup_service', 7, 2),
  P('Set/Unset the rightmost unset bit', E, 'startup_service', 7, 2),
  P('Swap two numbers', E, 'startup_service', 7, 2),
  P('Divide two integers without *, /, %', M, 'startup_service', 7, 2),
  P('Minimum Bit Flips to Convert Number', E, 'startup_service', 7, 2),
  P('Single Number', E, 'startup_service', 7, 2),
  P('Single Number II', M, 'startup_service', 7, 2),
  P('Single Number III', M, 'startup_service', 7, 2),
  P('XOR of numbers in a given range', M, 'startup_service', 7, 2),
  P('Find XOR of two numbers without XOR', E, 'startup_service', 7, 2),
  P('Power Set using Bits', M, 'startup_service', 7, 2),
  P('Find the two numbers appearing odd times', M, 'startup_service', 7, 2),
  P('Count Bits set till N', M, 'faang', 7, 2),
  P('Prime Factors of a Number', M, 'faang', 7, 2),
], 18, 'Bit Manipulation', E, 'startup_service', 7, 2);

const stackQueue = pad([
  P('Implement Stack using Arrays', E, 'startup_service', 8, 2),
  P('Implement Queue using Arrays', E, 'startup_service', 8, 2),
  P('Implement Stack using Queue', E, 'startup_service', 8, 2),
  P('Implement Queue using Stack', E, 'startup_service', 8, 2),
  P('Implement Stack using LinkedList', E, 'startup_service', 8, 2),
  P('Implement Queue using LinkedList', E, 'startup_service', 8, 2),
  P('Check for Balanced Parentheses', E, 'startup_service', 8, 2),
  P('Implement Min Stack', M, 'startup_service', 8, 2),
  P('Infix to Postfix Conversion', M, 'startup_service', 8, 2),
  P('Prefix to Infix Conversion', M, 'startup_service', 8, 2),
  P('Prefix to Postfix Conversion', M, 'startup_service', 8, 2),
  P('Postfix to Prefix Conversion', M, 'startup_service', 8, 2),
  P('Postfix to Infix Conversion', M, 'startup_service', 8, 2),
  P('Infix to Prefix Conversion', M, 'startup_service', 8, 2),
  P('Next Greater Element', M, 'startup_service', 8, 2),
  P('Next Greater Element II', M, 'startup_service', 8, 2),
  P('Next Smaller Element', M, 'startup_service', 8, 2),
  P('Number of NGEs to the right', M, 'startup_service', 8, 2),
  P('Trapping Rainwater', H, 'startup_service', 8, 2),
  P('Sum of subarray minimums', M, 'startup_service', 9, 2),
  P('Asteroid Collision', M, 'startup_service', 8, 2),
  P('Sum of subarray ranges', M, 'faang', 9, 2),
  P('Remove K Digits', M, 'startup_service', 9, 2),
  P('Largest Rectangle in Histogram', H, 'faang', 9, 2),
  P('Maximal Rectangle', H, 'faang', 9, 2),
  P('Sliding Window Maximum', H, 'faang', 8, 2),
  P('Stock Span Problem', M, 'startup_service', 8, 2),
  P('The Celebrity Problem', M, 'startup_service', 8, 2),
  P('LRU Cache', H, 'faang', 6, 2),
  P('LFU Cache', H, 'faang', 11, 3),
], 30, 'Stack and Queues', M, 'startup_service', 8, 2);

const slidingWindow = pad([
  P('Longest Substring Without Repeating Characters', M, 'startup_service', 8, 2),
  P('Max Consecutive Ones III', M, 'startup_service', 8, 2),
  P('Fruit Into Baskets', M, 'startup_service', 8, 2),
  P('Longest Repeating Character Replacement', M, 'startup_service', 8, 2),
  P('Binary Subarrays With Sum', M, 'startup_service', 8, 2),
  P('Count Number of Nice Subarrays', M, 'startup_service', 8, 2),
  P('Number of Substrings Containing All Three Characters', M, 'startup_service', 8, 2),
  P('Maximum Points You Can Obtain from Cards', M, 'startup_service', 8, 2),
  P('Longest Substring with At Most K Distinct Characters', M, 'startup_service', 8, 2),
  P('Subarray with k different integers', H, 'faang', 8, 2),
  P('Minimum Window Substring', H, 'faang', 8, 2),
  P('Minimum Window Subsequence', H, 'faang', 8, 2),
], 12, 'Sliding Window', M, 'startup_service', 8, 2);

const heaps = pad([
  P('Introduction to Priority Queues', E, 'faang', 10, 3),
  P('Min Heap and Max Heap Implementation', M, 'faang', 10, 3),
  P('Check if an array represents a min-heap', E, 'faang', 10, 3),
  P('Convert Min Heap to Max Heap', M, 'faang', 10, 3),
  P('Kth largest element in an array', M, 'faang', 11, 3),
  P('Kth smallest element in an array', M, 'faang', 11, 3),
  P('Sort a K sorted array', M, 'faang', 11, 3),
  P('Merge M sorted Lists', H, 'faang', 11, 3),
  P('Replace each array element by its corresponding rank', M, 'faang', 11, 3),
  P('Task Scheduler', M, 'faang', 11, 3),
  P('Hands of Straights', M, 'faang', 11, 3),
  P('Design Twitter', M, 'faang', 11, 3),
  P('Connect `n` ropes with minimum cost', M, 'faang', 11, 3),
  P('Kth largest element in a stream', M, 'faang', 11, 3),
  P('Maximum Sum Combination', M, 'faang', 11, 3),
  P('Find Median from Data Stream', H, 'faang', 11, 3),
  P('K most frequent elements', M, 'faang', 11, 3),
], 17, 'Heaps', M, 'faang', 11, 3);

const greedy = pad([
  P('Assign Cookies', E, 'startup_service', 7, 2),
  P('Fractional Knapsack', M, 'startup_service', 7, 2),
  P('Minimum number of coins', E, 'startup_service', 7, 2),
  P('Lemonade Change', E, 'startup_service', 7, 2),
  P('Valid Parenthesis String', M, 'startup_service', 7, 2),
  P('N meetings in one room', M, 'startup_service', 7, 2),
  P('Jump Game', M, 'startup_service', 7, 2),
  P('Jump Game II', M, 'startup_service', 7, 2),
  P('Minimum number of platforms', M, 'startup_service', 7, 2),
  P('Job Sequencing Problem', M, 'startup_service', 7, 2),
  P('Candy', H, 'faang', 7, 2),
  P('Program for Shortest Job First', M, 'startup_service', 7, 2),
  P('Program for Least Recently Used Page Replacement', M, 'faang', 7, 2),
  P('Insert Interval', M, 'startup_service', 7, 2),
  P('Non-overlapping Intervals', M, 'startup_service', 7, 2),
], 15, 'Greedy', M, 'startup_service', 7, 2);

const binaryTrees = pad([
  P('Introduction to Trees', E, 'startup_service', 9, 2),
  P('Binary Tree Representation', E, 'startup_service', 9, 2),
  P('Binary Tree Traversals — Preorder', E, 'startup_service', 9, 2),
  P('Binary Tree Traversals — Inorder', E, 'startup_service', 9, 2),
  P('Binary Tree Traversals — Postorder', E, 'startup_service', 9, 2),
  P('Level Order Traversal', E, 'startup_service', 9, 2),
  P('Iterative Preorder Traversal', M, 'startup_service', 9, 2),
  P('Iterative Inorder Traversal', M, 'startup_service', 9, 2),
  P('Iterative Postorder (2 stacks)', M, 'startup_service', 9, 2),
  P('Iterative Postorder (1 stack)', M, 'startup_service', 9, 2),
  P('Preorder Inorder Postorder in one traversal', M, 'startup_service', 9, 2),
  P('Maximum Depth of Binary Tree', E, 'startup_service', 9, 2),
  P('Check for Balanced Binary Tree', E, 'startup_service', 9, 2),
  P('Diameter of Binary Tree', M, 'startup_service', 9, 2),
  P('Maximum Path Sum', H, 'faang', 10, 3),
  P('Check if two trees are Identical', E, 'startup_service', 9, 2),
  P('Zig-Zag Traversal', M, 'startup_service', 9, 2),
  P('Boundary Traversal', M, 'startup_service', 9, 2),
  P('Vertical Order Traversal', H, 'faang', 10, 3),
  P('Top View of Binary Tree', M, 'startup_service', 9, 2),
  P('Bottom View of Binary Tree', M, 'startup_service', 9, 2),
  P('Right / Left View of Binary Tree', M, 'startup_service', 9, 2),
  P('Symmetric Binary Tree', E, 'startup_service', 9, 2),
  P('Root to Node Path', M, 'startup_service', 9, 2),
  P('LCA in Binary Tree', M, 'startup_service', 9, 2),
  P('Maximum Width of Binary Tree', M, 'faang', 10, 3),
  P('Check for Children Sum Property', M, 'faang', 10, 3),
  P('Print all Nodes at Distance K', M, 'faang', 10, 3),
  P('Minimum time to burn tree from node', H, 'faang', 10, 3),
  P('Count Complete Tree Nodes', M, 'faang', 10, 3),
  P('Construct BT from Preorder and Inorder', M, 'faang', 10, 3),
  P('Construct BT from Postorder and Inorder', M, 'faang', 10, 3),
  P('Serialize and Deserialize Binary Tree', H, 'faang', 10, 3),
  P('Morris Preorder Traversal', H, 'faang', 10, 3),
  P('Morris Inorder Traversal', H, 'faang', 10, 3),
  P('Flatten Binary Tree to LinkedList', M, 'faang', 10, 3),
  P('Binary Tree Paths', E, 'startup_service', 9, 2),
  P('Path Sum I / II', M, 'startup_service', 9, 2),
], 38, 'Binary Trees', M, 'startup_service', 9, 2);

const bst = pad([
  P('Introduction to BST', E, 'faang', 10, 3),
  P('Search in a BST', E, 'faang', 10, 3),
  P('Find Min/Max in BST', E, 'faang', 10, 3),
  P('Ceil in BST', M, 'faang', 10, 3),
  P('Floor in BST', M, 'faang', 10, 3),
  P('Insert a given Node in BST', E, 'faang', 10, 3),
  P('Delete a Node in BST', M, 'faang', 10, 3),
  P('Find K-th smallest/largest in BST', M, 'faang', 10, 3),
  P('Check if a tree is a BST', M, 'faang', 10, 3),
  P('LCA in BST', E, 'faang', 10, 3),
  P('Construct BST from Preorder', M, 'faang', 10, 3),
  P('Inorder Successor/Predecessor in BST', M, 'faang', 10, 3),
  P('BST Iterator', M, 'faang', 10, 3),
  P('Two Sum In BST', M, 'faang', 10, 3),
  P('Recover BST', H, 'faang', 10, 3),
  P('Largest BST in Binary Tree', H, 'faang', 10, 3),
], 16, 'Binary Search Trees', M, 'faang', 10, 3);

const graphs = pad([
  P('Graph Representation — Adjacency Matrix', E, 'faang', 11, 3),
  P('Graph Representation — Adjacency List', E, 'faang', 11, 3),
  P('BFS Traversal', E, 'faang', 11, 3),
  P('DFS Traversal', E, 'faang', 11, 3),
  P('Number of Provinces', M, 'faang', 11, 3),
  P('Connected Components in Matrix', M, 'faang', 11, 3),
  P('Rotten Oranges', M, 'faang', 11, 3),
  P('Flood Fill', E, 'faang', 11, 3),
  P('Cycle Detection in Undirected Graph (BFS)', M, 'faang', 11, 3),
  P('Cycle Detection in Undirected Graph (DFS)', M, 'faang', 11, 3),
  P('0/1 Matrix (Distance to nearest 0)', M, 'faang', 11, 3),
  P('Surrounded Regions', M, 'faang', 11, 3),
  P('Number of Enclaves', M, 'faang', 11, 3),
  P('Word Ladder I', H, 'faang', 12, 3),
  P('Word Ladder II', H, 'faang', 12, 3),
  P('Number of Distinct Islands', M, 'faang', 11, 3),
  P('Bipartite Graph (BFS)', M, 'faang', 11, 3),
  P('Bipartite Graph (DFS)', M, 'faang', 11, 3),
  P('Cycle Detection in Directed Graph (DFS)', M, 'faang', 11, 3),
  P('Topo Sort (DFS)', M, 'faang', 11, 3),
  P('Topo Sort (Kahn\'s BFS)', M, 'faang', 11, 3),
  P('Cycle Detection in Directed Graph (BFS/Kahn)', M, 'faang', 11, 3),
  P('Course Schedule I', M, 'faang', 12, 3),
  P('Course Schedule II', M, 'faang', 12, 3),
  P('Find Eventual Safe States', M, 'faang', 12, 3),
  P('Alien Dictionary', H, 'faang', 12, 3),
  P('Shortest Path in Undirected Graph (Unit weights)', M, 'faang', 12, 3),
  P('Shortest Path in DAG', M, 'faang', 12, 3),
  P('Dijkstra\'s Algorithm', M, 'faang', 12, 3),
  P('Dijkstra — Why not Negative Weights', E, 'faang', 12, 3),
  P('Binary Maze Shortest Path', M, 'faang', 12, 3),
  P('Path with Minimum Effort', M, 'faang', 12, 3),
  P('Cheapest Flights Within K Stops', M, 'faang', 12, 3),
  P('Network Delay Time', M, 'faang', 12, 3),
  P('Number of Ways to Arrive at Destination', M, 'faang', 12, 3),
  P('Bellman Ford Algorithm', M, 'faang', 12, 3),
  P('Floyd Warshall Algorithm', M, 'faang', 12, 3),
  P('Find the City With the Smallest Number of Neighbors', M, 'faang', 12, 3),
  P("Prim's Algorithm", M, 'faang', 12, 3),
  P("Kruskal's Algorithm", M, 'faang', 12, 3),
  P('Number of Operations to Make Network Connected', M, 'faang', 12, 3),
  P('Most Stones Removed', M, 'faang', 12, 3),
  P('Accounts Merge', H, 'faang', 12, 3),
  P('Number of Islands II', H, 'faang', 12, 3),
  P('Making A Large Island', H, 'faang', 12, 3),
  P('Swim in Rising Water', H, 'faang', 12, 3),
  P('Bridges in Graph', H, 'faang', 12, 3),
  P('Articulation Point', H, 'faang', 12, 3),
  P('Kosaraju\'s Algorithm (SCC)', H, 'faang', 12, 3),
  P('Critical Connections', H, 'faang', 12, 3),
  P('Minimum Spanning Tree Theory', E, 'faang', 12, 3),
  P('Disjoint Set — Union by Rank / Size', M, 'faang', 12, 3),
  P('Disjoint Set — Path Compression', M, 'faang', 12, 3),
], 53, 'Graphs', M, 'faang', 12, 3);

const dp = pad([
  P('Introduction to DP', E, 'faang', 12, 3),
  P('Climbing Stairs', E, 'faang', 12, 3),
  P('Frog Jump', M, 'faang', 12, 3),
  P('Frog Jump with K distances', M, 'faang', 12, 3),
  P('Maximum sum of non-adjacent elements', M, 'faang', 12, 3),
  P('House Robber', M, 'faang', 12, 3),
  P('House Robber II', M, 'faang', 12, 3),
  P('Ninja\'s Training', M, 'faang', 13, 4),
  P('Grid Unique Paths', M, 'faang', 13, 4),
  P('Grid Unique Paths II', M, 'faang', 13, 4),
  P('Minimum Path Sum in Grid', M, 'faang', 13, 4),
  P('Triangle — Minimum Path Sum', M, 'faang', 13, 4),
  P('Minimum Falling Path Sum', M, 'faang', 13, 4),
  P('Cherry Pickup II', H, 'faang', 13, 4),
  P('Subset Sum Equal to Target', M, 'faang', 13, 4),
  P('Partition Equal Subset Sum', M, 'faang', 13, 4),
  P('Partition Set Into 2 Subsets With Min Absolute Sum Diff', M, 'faang', 13, 4),
  P('Count Subsets with Sum K', M, 'faang', 13, 4),
  P('Count Partitions with Given Difference', M, 'faang', 13, 4),
  P('0/1 Knapsack', M, 'faang', 13, 4),
  P('Minimum Coins', M, 'faang', 13, 4),
  P('Target Sum', M, 'faang', 13, 4),
  P('Coin Change 2', M, 'faang', 13, 4),
  P('Unbounded Knapsack', M, 'faang', 13, 4),
  P('Rod Cutting Problem', M, 'faang', 13, 4),
  P('Longest Common Subsequence', M, 'faang', 13, 4),
  P('Print LCS', M, 'faang', 13, 4),
  P('Longest Common Substring', M, 'faang', 13, 4),
  P('Longest Palindromic Subsequence', M, 'faang', 13, 4),
  P('Minimum Insertions to Make String Palindrome', M, 'faang', 13, 4),
  P('Minimum Insertions/Deletions to Convert String', M, 'faang', 13, 4),
  P('Shortest Common Supersequence', M, 'faang', 13, 4),
  P('Distinct Subsequences', H, 'faang', 13, 4),
  P('Edit Distance', H, 'faang', 13, 4),
  P('Wildcard Matching', H, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock', E, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock II', M, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock III', H, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock IV', H, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock with Cooldown', M, 'faang', 13, 4),
  P('Best Time to Buy and Sell Stock with Transaction Fee', M, 'faang', 13, 4),
  P('Longest Increasing Subsequence', M, 'faang', 13, 4),
  P('Print LIS', M, 'faang', 13, 4),
  P('LIS using Binary Search', M, 'faang', 13, 4),
  P('Largest Divisible Subset', M, 'faang', 13, 4),
  P('Longest String Chain', M, 'faang', 13, 4),
  P('Longest Bitonic Subsequence', M, 'faang', 13, 4),
  P('Number of LIS', M, 'faang', 13, 4),
  P('Matrix Chain Multiplication', H, 'faang', 13, 4),
  P('Minimum Cost to Cut a Stick', H, 'faang', 13, 4),
  P('Burst Balloons', H, 'faang', 13, 4),
  P('Evaluate Boolean Expression to True', H, 'faang', 13, 4),
  P('Palindrome Partitioning II', H, 'faang', 13, 4),
  P('Partition Array for Maximum Sum', M, 'faang', 13, 4),
  P('Maximum Profit in Job Scheduling', H, 'faang', 13, 4),
], 55, 'Dynamic Programming', M, 'faang', 13, 4);

const tries = pad([
  P('Implement TRIE — Insert, Search, StartsWith', M, 'faang', 14, 4),
  P('Implement Trie — II (Count words)', M, 'faang', 14, 4),
  P('Longest String with All Prefixes', M, 'faang', 14, 4),
  P('Number of Distinct Substrings in a String', H, 'faang', 14, 4),
  P('Bit Prerequisites for Trie Problems', M, 'faang', 14, 4),
  P('Maximum XOR of Two Numbers in an Array', H, 'faang', 14, 4),
  P('Maximum XOR With an Element From Array', H, 'faang', 14, 4),
], 7, 'Tries', M, 'faang', 14, 4);

const stringsAdv = pad([
  P('Z-Function', H, 'faang', 14, 4),
  P('KMP Algorithm / LPS', H, 'faang', 14, 4),
  P('Minimum characters to add at front for palindrome', H, 'faang', 14, 4),
  P('Rabin Karp', M, 'faang', 14, 4),
  P('Z-Algorithm applications', H, 'faang', 14, 4),
  P('Count and say', M, 'faang', 14, 4),
  P('Hashing in Strings — Theory', M, 'faang', 14, 4),
  P('Shortest Palindrome', H, 'faang', 14, 4),
  P('Longest Happy Prefix', H, 'faang', 14, 4),
], 9, 'Strings Advanced', H, 'faang', 14, 4);

const STEPS = [
  { name: 'Learn the basics', problems: basics, month: 1, week: 1 },
  { name: 'Learn Important Sorting Techniques', problems: sorting, month: 1, week: 2 },
  { name: 'Solve Problems on Arrays [Easy → Medium → Hard]', problems: arrays, month: 1, week: 1 },
  { name: 'Binary Search [1D, 2D Arrays, Search Space]', problems: binarySearch, month: 1, week: 3 },
  { name: 'Strings [Basic and Medium]', problems: stringsBasic, month: 1, week: 4 },
  { name: 'Learn LinkedList [Single LL, Double LL, Medium, Hard]', problems: linkedList, month: 2, week: 6 },
  { name: 'Recursion [PatternWise]', problems: recursion, month: 2, week: 5 },
  { name: 'Bit Manipulation [Concepts & Problems]', problems: bitManip, month: 2, week: 7 },
  { name: 'Stack and Queues [Learning, Pre-In-Post, Monotonic]', problems: stackQueue, month: 2, week: 8 },
  { name: 'Sliding Window & Two Pointer Combined Problems', problems: slidingWindow, month: 2, week: 8 },
  { name: 'Heaps [Learning, Medium, Hard Problems]', problems: heaps, month: 3, week: 11 },
  { name: 'Greedy Algorithms [Easy, Medium/Hard]', problems: greedy, month: 2, week: 7 },
  { name: 'Binary Trees [Traversals, Medium and Hard Problems]', problems: binaryTrees, month: 2, week: 9 },
  { name: 'Binary Search Trees [Concept and Problems]', problems: bst, month: 3, week: 10 },
  { name: 'Graphs [Concepts & Problems]', problems: graphs, month: 3, week: 11 },
  { name: 'Dynamic Programming [Patterns and Problems]', problems: dp, month: 4, week: 13 },
  { name: 'Tries', problems: tries, month: 4, week: 14 },
  { name: 'Strings (Advanced)', problems: stringsAdv, month: 4, week: 14 },
];

const topics = [];
const problems = [];
let order = 0;

for (const step of STEPS) {
  order += 1;
  topics.push({
    name: step.name,
    a2zStep: order,
    month: step.month,
    week: step.week,
    order,
    totalProblems: step.problems.length
  });
  step.problems.forEach((p, idx) => {
    // Normalize track: startup_service problems also count toward full; faang-only stay faang
    // "both" for problems useful in both eras
    let track = p.track;
    if (track === 'startup_service' && p.difficulty === 'Hard' && p.targetPhase >= 3) {
      track = 'faang';
    }
    problems.push({
      topicName: step.name,
      name: p.name,
      difficulty: p.difficulty,
      status: 'Todo',
      track,
      targetWeek: p.targetWeek,
      targetPhase: p.targetPhase,
      orderInStep: idx + 1,
      a2zStep: order
    });
  });
}

// Mark first 23 as Done (current progress baseline from profile)
for (let i = 0; i < 23 && i < problems.length; i++) {
  problems[i].status = 'Done';
}

const dataDir = path.join(__dirname, 'data');
fs.writeFileSync(path.join(dataDir, 'a2z-topics.json'), JSON.stringify(topics, null, 2));
fs.writeFileSync(path.join(dataDir, 'a2z-problems.json'), JSON.stringify(problems, null, 2));

const byTrack = {
  startup_service: problems.filter((p) => p.track === 'startup_service').length,
  faang: problems.filter((p) => p.track === 'faang').length,
  both: problems.filter((p) => p.track === 'both').length
};
console.log(`Topics: ${topics.length}`);
console.log(`Problems: ${problems.length}`);
console.log('By track:', byTrack);
console.log('Sep-ready set (startup_service + both):', byTrack.startup_service + byTrack.both);

if (problems.length !== 474) {
  console.warn(`WARNING: expected 474, got ${problems.length}`);
}

module.exports = { topics, problems };
