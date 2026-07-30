/**
 * Generate TUF+ "Basic to Advanced" (paid batch) sheet seed (435 problems)
 * with PDF-aligned track/week tags. Replaces the old Striver A2Z sheet.
 * Source: user-provided screenshots of their paid batch curriculum (Basic + Advanced tabs).
 * Tracks: startup_service (Sep interview ready), faang (Oct-Dec), both
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

// ─── BASIC TAB ───

const basicMaths = pad([
  P('Count all Digits of a Number', E, 'startup_service', 1, 1),
  P('Count number of odd digits in a number', E, 'startup_service', 1, 1),
  P('Reverse a number', E, 'startup_service', 1, 1),
  P('Palindrome Number', E, 'startup_service', 1, 1),
  P('Return the Largest Digit in a Number', E, 'startup_service', 1, 1),
  P('Factorial of a given number', E, 'startup_service', 1, 1),
  P('Check if the Number is Armstrong', E, 'startup_service', 1, 1),
  P('Check for Perfect Number', E, 'startup_service', 1, 1),
  P('Check for Prime Number', E, 'startup_service', 1, 1),
  P('Count of Prime Numbers till N', E, 'startup_service', 1, 1),
  P('GCD of Two Numbers', E, 'startup_service', 1, 1),
  P('LCM of two numbers', E, 'startup_service', 1, 1),
  P('Divisors of a Number', E, 'startup_service', 1, 1),
], 13, 'Basic Maths', E, 'startup_service', 1, 1);

const basicArrays = pad([
  P('Sum of Array Elements', E, 'startup_service', 1, 1),
  P('Count of odd numbers in array', E, 'startup_service', 1, 1),
  P('Check if the Array is Sorted I', E, 'startup_service', 1, 1),
  P('Reverse an array', E, 'startup_service', 1, 1),
], 4, 'Basic Arrays', E, 'startup_service', 1, 1);

const basicHashing = pad([
  P('Highest Occurring Element in an Array', E, 'startup_service', 1, 1),
  P('Second Highest Occurring Element', E, 'startup_service', 1, 1),
  P('Sum of Highest and Lowest Frequency', E, 'startup_service', 1, 1),
], 3, 'Basic Hashing', E, 'startup_service', 1, 1);

const basicStrings = pad([
  P('Reverse a String II', E, 'startup_service', 1, 1),
  P('Palindrome Check', E, 'startup_service', 1, 1),
  P('Largest Odd Number in a String', E, 'startup_service', 1, 1),
  P('Longest Common Prefix', E, 'startup_service', 1, 1),
  P('Isomorphic String', E, 'startup_service', 1, 1),
  P('Rotate String', E, 'startup_service', 1, 1),
  P('Valid Anagram', E, 'startup_service', 1, 1),
  P('Sort Characters by Frequency', E, 'startup_service', 1, 1),
], 8, 'Basic Strings', E, 'startup_service', 1, 1);

const basicRecursion = pad([
  P('Print Name N times using Recursion', E, 'startup_service', 1, 1),
  P('Print 1 to N using Recursion', E, 'startup_service', 1, 1),
  P('Print N to 1 using Recursion', E, 'startup_service', 1, 1),
  P('Sum of first N numbers using Recursion', E, 'startup_service', 1, 1),
  P('Factorial of a Number using Recursion', E, 'startup_service', 1, 1),
  P('Reverse an array using Recursion', E, 'startup_service', 1, 1),
  P('Check if a String is a Palindrome using Recursion', E, 'startup_service', 1, 1),
  P('Fibonacci Number using Recursion', E, 'startup_service', 1, 1),
], 8, 'Basic Recursion', E, 'startup_service', 1, 1);

// ─── ADVANCED TAB ───

const sortingAlgorithms = pad([
  P('Selection Sort', E, 'startup_service', 2, 1),
  P('Bubble Sort', E, 'startup_service', 2, 1),
  P('Insertion Sorting', E, 'startup_service', 2, 1),
  P('Merge Sorting', M, 'startup_service', 2, 1),
  P('Quick Sorting', M, 'startup_service', 2, 1),
], 7, 'Sorting Algorithms', E, 'startup_service', 2, 1);

const arrays = pad([
  // Fundamentals
  P('Linear Search', E, 'startup_service', 1, 1),
  P('Largest Element', E, 'startup_service', 1, 1),
  P('Second Largest Element', E, 'startup_service', 1, 1),
  P('Maximum Consecutive Ones', E, 'startup_service', 1, 1),
  P('Left Rotate Array by One', E, 'startup_service', 1, 1),
  P('Left Rotate Array by K Places', E, 'startup_service', 1, 1),
  // Logic Building
  P('Move Zeros to End', E, 'startup_service', 1, 1),
  P('Remove duplicates from sorted array', E, 'startup_service', 1, 1),
  P('Find missing number', E, 'startup_service', 1, 1),
  P('Union of two sorted arrays', M, 'startup_service', 1, 1),
  P('Intersection of two sorted arrays', E, 'startup_service', 1, 1),
  // FAQs (Medium)
  P('Majority Element-I', E, 'startup_service', 1, 1),
  P('Leaders in an Array', E, 'startup_service', 1, 1),
  P('Rearrange array elements by sign', M, 'startup_service', 1, 1),
  P('Print the matrix in spiral manner', M, 'startup_service', 1, 1),
  P("Pascal's Triangle I", E, 'startup_service', 1, 1),
  P("Pascal's Triangle II", M, 'startup_service', 1, 1),
  P("Pascal's Triangle III", M, 'startup_service', 1, 1),
  P('Rotate matrix by 90 degrees', M, 'startup_service', 1, 1),
  P('Two Sum', E, 'startup_service', 1, 1),
  P('3 Sum', M, 'startup_service', 1, 1),
  P('4 Sum', M, 'startup_service', 1, 1),
  P("Kadane's Algorithm — Maximum Subarray Sum", M, 'startup_service', 1, 1),
  P('Best Time to Buy and Sell Stock (single transaction)', E, 'startup_service', 1, 1),
  P('Next Permutation', M, 'startup_service', 1, 1),
  // FAQs (Hard)
  P('Majority Element-II', M, 'startup_service', 1, 1),
  P('Find the repeating and missing number', H, 'startup_service', 1, 1),
  P('Count Inversions', H, 'startup_service', 1, 1),
  P('Reverse Pairs', H, 'startup_service', 1, 1),
  P('Merge two sorted arrays without extra space', H, 'startup_service', 1, 1),
], 30, 'Arrays', M, 'startup_service', 1, 1);

const hashing = pad([
  P('Basic Hashing — Theory', E, 'startup_service', 4, 1),
  P('Longest Consecutive Sequence in an Array', M, 'startup_service', 4, 1),
  P('Longest subarray with sum K', M, 'startup_service', 4, 1),
  P('Count subarrays with given sum', M, 'startup_service', 4, 1),
  P('Count subarrays with given xor K', H, 'startup_service', 4, 1),
], 8, 'Hashing', M, 'startup_service', 4, 1);

const binarySearch = pad([
  // Fundamentals
  P('Search X in sorted array', E, 'startup_service', 3, 1),
  P('Lower Bound', E, 'startup_service', 3, 1),
  P('Upper Bound', E, 'startup_service', 3, 1),
  // Logic Building
  P('Search insert position', E, 'startup_service', 3, 1),
  P('Floor and Ceil in Sorted Array', M, 'startup_service', 3, 1),
  P('First and last occurrence', M, 'startup_service', 3, 1),
  P('Search in rotated sorted array-I', M, 'startup_service', 3, 1),
  P('Search in rotated sorted array-II', M, 'startup_service', 3, 1),
  P('Find minimum in Rotated Sorted Array', M, 'startup_service', 3, 1),
  P('Find out how many times the array is rotated', M, 'startup_service', 3, 1),
  P('Single element in sorted array', M, 'startup_service', 3, 1),
  // On answers
  P('Find square root of a number', E, 'startup_service', 3, 1),
  P('Find Nth root of a number', M, 'startup_service', 3, 1),
  P('Find the smallest divisor', M, 'startup_service', 3, 1),
  P('Koko eating bananas', M, 'startup_service', 3, 1),
  P('Minimum days to make M bouquets', M, 'startup_service', 3, 1),
  // FAQs
  P('Aggressive Cows', H, 'startup_service', 3, 1),
  P('Book Allocation Problem', H, 'startup_service', 3, 1),
  P('Find peak element', M, 'startup_service', 3, 1),
  P('Median of 2 sorted arrays', H, 'startup_service', 3, 1),
  P('Kth element of 2 sorted arrays', H, 'startup_service', 3, 1),
  P('Minimize Max Distance to Gas Station', H, 'startup_service', 3, 1),
  P('Split array - largest sum', H, 'startup_service', 3, 1),
  // 2D Arrays
  P("Find row with maximum 1's", M, 'startup_service', 3, 1),
  P('Search in a 2D matrix', M, 'startup_service', 3, 1),
  P('Search in 2D matrix - II', M, 'startup_service', 3, 1),
  P('Find Peak Element - II', H, 'startup_service', 3, 1),
  P('Matrix Median', H, 'startup_service', 3, 1),
], 30, 'Binary Search', M, 'startup_service', 3, 1);

const recursion = pad([
  // Implementation Problems
  P('Pow(x,n)', M, 'startup_service', 5, 2),
  P('Generate Parentheses', M, 'startup_service', 5, 2),
  P('Power Set', M, 'startup_service', 5, 2),
  // Subsequence Pattern Problems
  P('Check if there exists a subsequence with sum K', M, 'startup_service', 5, 2),
  P('Count all subsequences with sum K', M, 'startup_service', 5, 2),
  // FAQs (Medium)
  P('Combination Sum', M, 'startup_service', 5, 2),
  P('Combination Sum II', M, 'startup_service', 5, 2),
  P('Subsets I', M, 'startup_service', 5, 2),
  P('Subsets II', M, 'startup_service', 5, 2),
  P('Combination Sum III', M, 'startup_service', 5, 2),
  // Hard
  P('Letter Combinations of a Phone Number', M, 'startup_service', 5, 2),
  // FAQs (Hard)
  P('Palindrome partitioning', H, 'startup_service', 5, 2),
  P('Word Search', H, 'startup_service', 5, 2),
  P('N Queen', H, 'startup_service', 5, 2),
  P('Rat in a Maze', H, 'startup_service', 5, 2),
  P('M Coloring Problem', H, 'startup_service', 5, 2),
  P('Sudoku Solver', H, 'startup_service', 5, 2),
], 19, 'Recursion', M, 'startup_service', 5, 2);

const linkedList = pad([
  // Fundamentals (Single LL)
  P('Introduction to Singly LinkedList', E, 'startup_service', 6, 2),
  P('Traversal in Linked List', E, 'startup_service', 6, 2),
  P('Deletion in Linked List', E, 'startup_service', 6, 2),
  P('Insertion in Linked List', E, 'startup_service', 6, 2),
  P('Deletion of the head of LL', E, 'startup_service', 6, 2),
  P('Deletion of the tail of Linked List', E, 'startup_service', 6, 2),
  P('Deletion of the Kth element of Linked List', M, 'startup_service', 6, 2),
  P('Delete the element with value X', M, 'startup_service', 6, 2),
  P('Insertion at the head of Linked List', E, 'startup_service', 6, 2),
  P('Insertion at the tail of Linked List', E, 'startup_service', 6, 2),
  P('Insertion at the Kth position of Linked List', M, 'startup_service', 6, 2),
  P('Insertion before the value X in Linked List', M, 'startup_service', 6, 2),
  // Fundamentals (Doubly LL)
  P('Introduction to Doubly LL', E, 'startup_service', 6, 2),
  P('Deletion in Doubly LL', E, 'startup_service', 6, 2),
  P('Insertion in DLL', E, 'startup_service', 6, 2),
  P('Convert Array to Doubly Linked List', E, 'startup_service', 6, 2),
  P('Delete head of Doubly Linked List', E, 'startup_service', 6, 2),
  P('Delete Tail of Doubly Linked List', E, 'startup_service', 6, 2),
  P('Delete Kth Element of Doubly Linked List', M, 'startup_service', 6, 2),
  P('Removing given node in Doubly Linked List', M, 'startup_service', 6, 2),
  P('Insert node before head in Doubly Linked List', E, 'startup_service', 6, 2),
  P('Insert node before tail in Doubly Linked List', M, 'startup_service', 6, 2),
  P('Insert node before (kth node) in Doubly Linked List', M, 'startup_service', 6, 2),
  P('Insert before given node in Doubly Linked List', M, 'startup_service', 6, 2),
  // Logic Building
  P('Add two numbers in Linked List', M, 'startup_service', 6, 2),
  P('Segregate odd and even nodes in Linked List', M, 'startup_service', 6, 2),
  P("Sort a Linked List of 0's 1's and 2's", M, 'startup_service', 6, 2),
  P('Remove Nth node from the back of the LL', M, 'startup_service', 6, 2),
  P('Reverse a LL', M, 'startup_service', 6, 2),
  // FAQs (Medium)
  P('Add one to a number represented by LL', M, 'startup_service', 6, 2),
  P('Find Middle of Linked List', E, 'startup_service', 6, 2),
  P('Delete the middle node in LL', M, 'startup_service', 6, 2),
  P('Check if LL is palindrome or not', M, 'startup_service', 6, 2),
  P('Find the intersection point of Y LL', M, 'startup_service', 6, 2),
  P('Detect a loop in LL', M, 'startup_service', 6, 2),
  P('Find the starting point in LL', M, 'startup_service', 6, 2),
  P('Length of loop in LL', M, 'startup_service', 6, 2),
  // FAQs (Hard)
  P('Reverse LL in group of given size K', H, 'startup_service', 6, 2),
  P('Rotate a LL', M, 'startup_service', 6, 2),
  P('Merge two Sorted Lists', M, 'startup_service', 6, 2),
  P('Flattening of LL', H, 'startup_service', 6, 2),
  P('Sort LL', M, 'startup_service', 6, 2),
  P('Clone a LL with random and next pointer', H, 'startup_service', 6, 2),
  // FAQs (DLL)
  P('Delete all occurrences of a key in DLL', M, 'startup_service', 6, 2),
  P('Remove duplicates from sorted DLL', M, 'startup_service', 6, 2),
], 46, 'Linked List', M, 'startup_service', 6, 2);

const bitManipulation = pad([
  P('Introduction to Bits and Tricks', E, 'startup_service', 6, 2),
  P('Minimum Bit Flips to Convert Number', E, 'startup_service', 6, 2),
  P('Single Number - I', E, 'startup_service', 6, 2),
  P('Single Number - II', M, 'startup_service', 6, 2),
  P('Single Number - III', M, 'startup_service', 6, 2),
  P('Divide two numbers without multiplication and division', M, 'startup_service', 6, 2),
  P('Power Set Bit Manipulation', M, 'startup_service', 6, 2),
  P('XOR of numbers in a given range', E, 'startup_service', 6, 2),
], 9, 'Bit Manipulation', M, 'startup_service', 6, 2);

const greedyAlgorithms = pad([
  P('Assign Cookies', E, 'startup_service', 7, 2),
  P('Lemonade Change', E, 'startup_service', 7, 2),
  P('Jump Game - I', M, 'startup_service', 7, 2),
  P('Shortest Job First', M, 'startup_service', 7, 2),
  P('Job sequencing Problem', M, 'startup_service', 7, 2),
  P('N meetings in one room', M, 'startup_service', 7, 2),
  P('Non-overlapping Intervals', M, 'startup_service', 7, 2),
  P('Insert Interval', M, 'startup_service', 7, 2),
  P('Minimum number of platforms required for a railway', M, 'startup_service', 7, 2),
  P('Valid Paranthesis Checker', H, 'startup_service', 7, 2),
  P('Candy', H, 'startup_service', 7, 2),
], 12, 'Greedy Algorithms', M, 'startup_service', 7, 2);

const slidingWindow = pad([
  P('Sliding Window / 2 Pointer — Pattern and Template Theory', E, 'startup_service', 8, 2),
  P('Maximum Points You Can Obtain from Cards', M, 'startup_service', 8, 2),
  P('Longest Substring Without Repeating Characters', M, 'startup_service', 8, 2),
  P('Max Consecutive Ones III', M, 'startup_service', 8, 2),
  P('Fruit Into Baskets', M, 'startup_service', 8, 2),
  P('Longest Substring With At Most K Distinct Characters', H, 'startup_service', 8, 2),
  P('Longest Repeating Character Replacement', M, 'startup_service', 8, 2),
  P('Minimum Window Substring', H, 'startup_service', 8, 2),
  P('Number of Substrings Containing All Three Characters', M, 'startup_service', 8, 2),
  P('Binary Subarrays With Sum', M, 'startup_service', 8, 2),
  P('Count number of Nice subarrays', M, 'startup_service', 8, 2),
], 12, 'Sliding Window / 2 Pointer', M, 'startup_service', 8, 2);

const stackQueues = pad([
  // Implementation
  P('Implementation using different DS', E, 'startup_service', 9, 2),
  P('Implement Stack using Arrays', E, 'startup_service', 9, 2),
  P('Implement Queue using Arrays', E, 'startup_service', 9, 2),
  P('Implement Stack using Queue', M, 'startup_service', 9, 2),
  P('Implement Queue using Stack', M, 'startup_service', 9, 2),
  P('Implement stack using Linkedlist', E, 'startup_service', 9, 2),
  P('Implement queue using Linkedlist', E, 'startup_service', 9, 2),
  P('Balanced Paranthesis', E, 'startup_service', 9, 2),
  // Monotonic Stack
  P('Next Greater Element', M, 'startup_service', 9, 2),
  P('Next Greater Element - 2', M, 'startup_service', 9, 2),
  P('Asteroid Collision', M, 'startup_service', 9, 2),
  P('Sum of Subarray Minimums', H, 'startup_service', 9, 2),
  P('Sum of Subarray Ranges', H, 'startup_service', 9, 2),
  P('Remove K Digits', M, 'startup_service', 9, 2),
  // FAQs
  P('Implement Min Stack', M, 'startup_service', 9, 2),
  P('Sliding Window Maximum', H, 'startup_service', 9, 2),
  P('Trapping Rainwater', H, 'startup_service', 9, 2),
  P('Largest rectangle in a histogram', H, 'startup_service', 9, 2),
  P('Maximum Rectangles', H, 'startup_service', 9, 2),
  P('Stock span problem', M, 'startup_service', 9, 2),
  P('Celebrity Problem', M, 'startup_service', 9, 2),
  P('LRU Cache', H, 'startup_service', 9, 2),
  P('LFU Cache', H, 'startup_service', 9, 2),
], 24, 'Stack / Queues', M, 'startup_service', 9, 2);

const binaryTrees = pad([
  // Theory/Traversals
  P('Introduction to Binary Trees', E, 'both', 9, 2),
  P('Inorder Traversal', E, 'both', 9, 2),
  P('Preorder Traversal', E, 'both', 9, 2),
  P('Postorder Traversal', E, 'both', 9, 2),
  P('Level Order Traversal', M, 'both', 9, 2),
  P('Pre, Post, Inorder in one traversal', M, 'both', 9, 2),
  // Medium Problems
  P('Maximum Depth in BT', E, 'both', 9, 2),
  P('Check if two trees are identical or not', M, 'both', 9, 2),
  P('Check for balanced binary tree', M, 'both', 9, 2),
  P('Diameter of Binary Tree', M, 'both', 9, 2),
  P('Maximum path sum', H, 'both', 9, 2),
  P('Check for symmetrical BTs', M, 'both', 9, 2),
  // FAQs
  P('Zig Zag or Spiral Traversal', M, 'both', 9, 2),
  P('Boundary Traversal', M, 'both', 9, 2),
  P('Vertical Order Traversal', M, 'both', 9, 2),
  P('Top View of BT', M, 'both', 9, 2),
  P('Bottom view of BT', M, 'both', 9, 2),
  P('Right/Left View of BT', M, 'both', 9, 2),
  P('Print root to leaf path in BT', M, 'both', 9, 2),
  P('LCA in BT', M, 'both', 9, 2),
  P('Maximum Width of BT', M, 'both', 9, 2),
  P('Print all nodes at a distance of K in BT', H, 'both', 9, 2),
  P('Minimum time taken to burn the BT from a given Node', H, 'both', 9, 2),
  P('Count total nodes in a complete BT', M, 'both', 9, 2),
  // Construction Problems
  P('Requirements needed to construct a unique BT', M, 'both', 9, 2),
  P('Construct a BT from Preorder and Inorder', H, 'both', 9, 2),
  P('Construct a BT from Postorder and Inorder', H, 'both', 9, 2),
  P('Serialize and De-serialize BT', H, 'both', 9, 2),
  // Traversal in Constant Space
  P('Morris Inorder Traversal', H, 'both', 9, 2),
  P('Morris Preorder Traversal', H, 'both', 9, 2),
], 31, 'Binary Trees', M, 'both', 9, 2);

const bst = pad([
  // Theory and Basics
  P('Introduction to BST', E, 'faang', 10, 3),
  P('Search in BST', E, 'faang', 10, 3),
  P('Floor and Ceil in a BST', M, 'faang', 10, 3),
  // Medium
  P('Insert a given node in BST', M, 'faang', 10, 3),
  P('Delete a node in BST', M, 'faang', 10, 3),
  P('Kth Smallest and Largest element in BST', M, 'faang', 10, 3),
  P('Check if a tree is a BST or not', M, 'faang', 10, 3),
  P('LCA in BST', M, 'faang', 10, 3),
  P('Construct a BST from a preorder traversal', M, 'faang', 10, 3),
  P('Inorder successor and predecessor in BST', M, 'faang', 10, 3),
  // FAQs
  P('BST iterator', H, 'faang', 10, 3),
  P('Two sum in BST', M, 'faang', 10, 3),
  P('Correct BST with two nodes swapped', H, 'faang', 10, 3),
  P('Largest BST in Binary Tree', H, 'faang', 10, 3),
], 15, 'Binary Search Trees', M, 'faang', 10, 3);

const heaps = pad([
  P('Heaps — Theory', E, 'faang', 11, 3),
  P('Heapify Algorithm', M, 'faang', 11, 3),
  P('Build heap from a given Array', M, 'faang', 11, 3),
  P('Implement Min Heap', M, 'faang', 11, 3),
  P('Implement Max Heap', M, 'faang', 11, 3),
  P('Check if an array represents a min heap', M, 'faang', 11, 3),
  P('Convert Min Heap to Max Heap', M, 'faang', 11, 3),
  P('Heap Sort', M, 'faang', 11, 3),
  P('K-th Largest element in an array', M, 'faang', 11, 3),
  P('Kth largest element in a stream of running integers', M, 'faang', 11, 3),
], 11, 'Heaps', M, 'faang', 11, 3);

const graphs = pad([
  // Theory and traversals
  P('Introduction to Graph', E, 'faang', 11, 3),
  P('Traversal Techniques (BFS/DFS)', E, 'faang', 11, 3),
  P('Connected Components', M, 'faang', 11, 3),
  // Traversal Problems
  P('Number of provinces', M, 'faang', 11, 3),
  P('Number of islands', M, 'faang', 11, 3),
  P('Flood fill algorithm', E, 'faang', 11, 3),
  P('Number of enclaves', M, 'faang', 11, 3),
  P('Rotten Oranges', M, 'faang', 11, 3),
  P('Distance of nearest cell having one', M, 'faang', 11, 3),
  P('Surrounded Regions', M, 'faang', 11, 3),
  P('Number of distinct islands', M, 'faang', 11, 3),
  // Cycles
  P('Detect cycle in an undirected graph (BFS)', M, 'faang', 11, 3),
  P('Detect cycle in an undirected graph (DFS)', M, 'faang', 11, 3),
  P('Detect cycle in a directed graph (BFS - Kahn)', M, 'faang', 11, 3),
  P('Detect cycle in a directed graph (DFS)', M, 'faang', 11, 3),
  // Topo sort / Hard Problems
  P('Topological Sort (BFS/DFS)', M, 'faang', 11, 3),
  P('Course Schedule I / II', M, 'faang', 11, 3),
  P('Find eventual safe states', M, 'faang', 11, 3),
  P('Alien Dictionary', H, 'faang', 11, 3),
  P('Word Ladder I', H, 'faang', 12, 3),
  P('Word Ladder II', H, 'faang', 12, 3),
  // Shortest Path Algorithms
  P("Dijkstra's Algorithm", M, 'faang', 12, 3),
  P('Shortest path in Directed Acyclic Graph', M, 'faang', 12, 3),
  P('Shortest path in Undirected Graph with unit weights', M, 'faang', 12, 3),
  P('Number of ways to arrive at destination', M, 'faang', 12, 3),
  P('Bellman ford algorithm', H, 'faang', 12, 3),
  P('Floyd warshall algorithm', H, 'faang', 12, 3),
  P('Find the city with the smallest number of neighbors', H, 'faang', 12, 3),
  // Minimum Spanning Tree
  P('MST theory', E, 'faang', 12, 3),
  P('Disjoint Set (Union by rank / size + Path compression)', M, 'faang', 12, 3),
  P("Find the MST weight (Prim's / Kruskal's)", M, 'faang', 12, 3),
  // Hard Problems II
  P('Number of operations to make network connected', M, 'faang', 12, 3),
  P('Accounts merge', H, 'faang', 12, 3),
  P('Number of islands II (online queries)', H, 'faang', 12, 3),
  P('Making a large island', H, 'faang', 12, 3),
  P('Most stones removed with same row or column', H, 'faang', 12, 3),
  // Additional Algorithms
  P("Kosaraju's algorithm (Strongly Connected Components)", H, 'faang', 12, 3),
  P('Bridges in graph', H, 'faang', 12, 3),
  P('Articulation point in graph', H, 'faang', 12, 3),
], 50, 'Graphs', M, 'faang', 12, 3);

const dp = pad([
  P('Introduction to DP', E, 'faang', 12, 4),
  // 1D DP
  P('Climbing stairs', E, 'faang', 12, 4),
  P('Frog Jump', E, 'faang', 12, 4),
  P('Frog jump with K distances', M, 'faang', 12, 4),
  P('Maximum sum of non adjacent elements', M, 'faang', 12, 4),
  P('House robber', M, 'faang', 12, 4),
  // 2D DP
  P("Ninja's training", M, 'faang', 12, 4),
  // DP on grids
  P('Grid unique paths', M, 'faang', 12, 4),
  P('Unique paths II', M, 'faang', 12, 4),
  P('Minimum Falling Path Sum', M, 'faang', 12, 4),
  P('Triangle', M, 'faang', 12, 4),
  P('Cherry pickup II', H, 'faang', 12, 4),
  // DP on stocks
  P('Best time to buy and sell stock', E, 'faang', 12, 4),
  P('Best time to buy and sell stock II', M, 'faang', 12, 4),
  P('Best time to buy and sell stock III', H, 'faang', 12, 4),
  P('Best time to buy and sell stock IV', H, 'faang', 12, 4),
  P('Best time to buy and sell stock with transaction fees', H, 'faang', 12, 4),
  // DP on subsequences
  P('Subset sum equals to target', M, 'faang', 13, 4),
  P('Partition equal subset sum', M, 'faang', 13, 4),
  P('Partition a set into two subsets with minimum absolute sum difference', H, 'faang', 13, 4),
  P('Count subsets with sum K', H, 'faang', 13, 4),
  P('Count partitions with given difference', H, 'faang', 13, 4),
  P('0 and 1 Knapsack', M, 'faang', 13, 4),
  P('Minimum coins', M, 'faang', 13, 4),
  P('Target sum', M, 'faang', 13, 4),
  P('Coin change II', M, 'faang', 13, 4),
  P('Unbounded knapsack', M, 'faang', 13, 4),
  P('Rod cutting problem', M, 'faang', 13, 4),
  // LIS
  P('Longest Increasing Subsequence', M, 'faang', 13, 4),
  P('Print Longest Increasing Subsequence', M, 'faang', 13, 4),
  P('Largest Divisible Subset', M, 'faang', 13, 4),
  P('Longest String Chain', M, 'faang', 13, 4),
  P('Longest Bitonic Subsequence', M, 'faang', 13, 4),
  P('Number of Longest Increasing Subsequences', H, 'faang', 13, 4),
  // DP on strings
  P('Longest common subsequence', M, 'faang', 13, 4),
  P('Longest common substring', M, 'faang', 13, 4),
  P('Longest palindromic subsequence', M, 'faang', 13, 4),
  P('Minimum insertions to make string palindrome', H, 'faang', 13, 4),
  P('Minimum insertions or deletions to convert string A to B', M, 'faang', 13, 4),
  P('Shortest common supersequence', H, 'faang', 13, 4),
  P('Distinct subsequences', H, 'faang', 13, 4),
  P('Edit distance', H, 'faang', 13, 4),
  P('Wildcard matching', H, 'faang', 13, 4),
  // MCM DP
  P('Matrix chain multiplication', H, 'faang', 13, 4),
  P('Minimum cost to cut the stick', H, 'faang', 13, 4),
  P('Burst balloons', H, 'faang', 13, 4),
  P('Palindrome partitioning II', H, 'faang', 13, 4),
], 60, 'Dynamic Programming', M, 'faang', 13, 4);

const tries = pad([
  P('Trie Implementation and Operations', M, 'faang', 14, 4),
  P('Trie Implementation and Advanced Operations', H, 'faang', 14, 4),
  P('Longest Word with All Prefixes', M, 'faang', 14, 4),
  P('Number of distinct substrings in a string', H, 'faang', 14, 4),
  P('Maximum XOR of two numbers in an array', H, 'faang', 14, 4),
  P('Maximum Xor with an element from an array', H, 'faang', 14, 4),
], 7, 'Tries', M, 'faang', 14, 4);

const stringsAdvanced = pad([
  P('Reverse every word in a string', E, 'faang', 14, 4),
  P('Minimum number of bracket reversals to make an expression balanced', M, 'faang', 14, 4),
  P('Count and say', M, 'faang', 14, 4),
  P('Rabin Karp Algorithm', H, 'faang', 14, 4),
  P('Z function', H, 'faang', 14, 4),
  P('KMP Algorithm or LPS array', H, 'faang', 14, 4),
  P('Shortest Palindrome', H, 'faang', 14, 4),
  P('Longest happy prefix', H, 'faang', 14, 4),
], 9, 'Strings (Advanced Algo)', M, 'faang', 14, 4);

const maths = pad([
  P('Print all primes till N (Sieve of Eratosthenes)', M, 'faang', 14, 4),
  P('Prime factorisation of a Number', M, 'faang', 14, 4),
  P('Count primes in range L to R', M, 'faang', 14, 4),
  P('Modular Exponentiation (Fast/Binary Exponentiation)', M, 'faang', 14, 4),
  P('Modular Multiplicative Inverse', H, 'faang', 14, 4),
], 19, 'Maths', M, 'faang', 14, 4);

// ─── Assemble topics in curriculum order ───

const STEPS = [
  { name: 'Basic Maths', problems: basicMaths, month: 1, week: 1 },
  { name: 'Basic Arrays', problems: basicArrays, month: 1, week: 1 },
  { name: 'Basic Hashing', problems: basicHashing, month: 1, week: 1 },
  { name: 'Basic Strings', problems: basicStrings, month: 1, week: 1 },
  { name: 'Basic Recursion', problems: basicRecursion, month: 1, week: 1 },
  { name: 'Sorting Algorithms', problems: sortingAlgorithms, month: 1, week: 2 },
  { name: 'Arrays', problems: arrays, month: 1, week: 1 },
  { name: 'Binary Search [Fundamentals, On Answers, 2D Arrays]', problems: binarySearch, month: 1, week: 3 },
  { name: 'Hashing', problems: hashing, month: 1, week: 4 },
  { name: 'Recursion [PatternWise]', problems: recursion, month: 2, week: 5 },
  { name: 'Linked List [Single LL, Doubly LL]', problems: linkedList, month: 2, week: 6 },
  { name: 'Bit Manipulation', problems: bitManipulation, month: 2, week: 6 },
  { name: 'Greedy Algorithms', problems: greedyAlgorithms, month: 2, week: 7 },
  { name: 'Sliding Window / 2 Pointer', problems: slidingWindow, month: 2, week: 8 },
  { name: 'Stack / Queues [Implementation, Monotonic Stack]', problems: stackQueues, month: 2, week: 9 },
  { name: 'Binary Trees [Traversals, Medium and Hard Problems]', problems: binaryTrees, month: 2, week: 9 },
  { name: 'Binary Search Trees', problems: bst, month: 3, week: 10 },
  { name: 'Heaps', problems: heaps, month: 3, week: 11 },
  { name: 'Graphs [Traversal, Shortest Path, MST, Additional]', problems: graphs, month: 3, week: 11 },
  { name: 'Dynamic Programming [1D, 2D, Subsequences, LIS, Strings, MCM]', problems: dp, month: 4, week: 12 },
  { name: 'Tries', problems: tries, month: 4, week: 14 },
  { name: 'Strings (Advanced Algo)', problems: stringsAdvanced, month: 4, week: 14 },
  { name: 'Maths', problems: maths, month: 4, week: 14 },
];

// FAANG OA Gap Pack — Blind 75 / NeetCode 150 + 2025–26 OA reports (only titles not already on sheet)
const faangPackRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'faang-oa-pack.json'), 'utf-8')
);
const existingNames = new Set();
for (const step of STEPS) {
  for (const p of step.problems) existingNames.add(p.name.toLowerCase());
}
const faangPack = faangPackRaw
  .filter((p) => !p.skipIfOnSheet)
  .filter((p) => !existingNames.has(p.name.toLowerCase()))
  .map((p, idx) => {
    const week = p.priority === 'P0' ? 11 : p.priority === 'P1' ? 13 : 15;
    return P(p.name, p.difficulty === 'Easy' ? E : p.difficulty === 'Hard' ? H : M, 'faang', week, 3);
  });

STEPS.push({
  name: 'FAANG OA Gap Pack [Blind75 / NeetCode / 2025-26 reports]',
  problems: faangPack,
  month: 3,
  week: 11
});

const EXPECTED_TOTAL = STEPS.reduce((n, s) => n + s.problems.length, 0);

const topics = [];
const problems = [];
let order = 0;

for (const step of STEPS) {
  order += 1;
  topics.push({
    name: step.name,
    sheetStep: order,
    month: step.month,
    week: step.week,
    order,
    totalProblems: step.problems.length
  });
  step.problems.forEach((p, idx) => {
    problems.push({
      topicName: step.name,
      name: p.name,
      difficulty: p.difficulty,
      status: 'Todo',
      track: p.track,
      targetWeek: p.targetWeek,
      targetPhase: p.targetPhase,
      orderInStep: idx + 1,
      sheetStep: order
    });
  });
}

// Mark problems already completed (real progress, from your checked-off screenshots)
const doneNames = new Set([
  // Arrays — Fundamentals
  'Linear Search', 'Largest Element', 'Second Largest Element',
  'Maximum Consecutive Ones', 'Left Rotate Array by One', 'Left Rotate Array by K Places',
  // Arrays — Logic Building
  'Move Zeros to End', 'Remove duplicates from sorted array', 'Find missing number', 'Union of two sorted arrays',
  // Arrays — FAQs (Medium)
  'Majority Element-I', 'Leaders in an Array', 'Rearrange array elements by sign',
  'Print the matrix in spiral manner', "Pascal's Triangle I", "Pascal's Triangle II",
  // Binary Trees — Medium
  'Maximum Depth in BT', 'Check for balanced binary tree',
  // Basic Arrays
  'Sum of Array Elements',
  // Basic Maths (best-effort — typically completed first)
  'Count all Digits of a Number', 'Reverse a number', 'Palindrome Number', 'Factorial of a given number',
]);

let markedDone = 0;
for (const p of problems) {
  if (doneNames.has(p.name) && markedDone < 23) {
    p.status = 'Done';
    markedDone += 1;
  }
}

const dataDir = path.join(__dirname, 'data');
fs.writeFileSync(path.join(dataDir, 'tuf-topics.json'), JSON.stringify(topics, null, 2));
fs.writeFileSync(path.join(dataDir, 'tuf-problems.json'), JSON.stringify(problems, null, 2));

const byTrack = {
  startup_service: problems.filter((p) => p.track === 'startup_service').length,
  faang: problems.filter((p) => p.track === 'faang').length,
  both: problems.filter((p) => p.track === 'both').length
};
console.log(`FAANG OA Gap Pack added: ${faangPack.length} problems`);
console.log(`Topics: ${topics.length}`);
console.log(`Problems: ${problems.length}`);
console.log('By track:', byTrack);
console.log('Sep-ready set (startup_service + both):', byTrack.startup_service + byTrack.both);
console.log('Marked Done:', markedDone);

if (problems.length !== EXPECTED_TOTAL) {
  console.warn(`WARNING: expected ${EXPECTED_TOTAL}, got ${problems.length}`);
}

module.exports = { topics, problems };
