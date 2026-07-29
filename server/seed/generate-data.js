const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Companies — PDF Batches A–F (180+), no Dummy fillers
require('./generate-companies');

// 2. DSA Topics (Striver A2Z)
const topics = [
  { name: "Arrays — Logic Building", totalProblems: 15, month: 1, week: 1 },
  { name: "Arrays — FAQs Medium", totalProblems: 12, month: 1, week: 1 },
  { name: "Arrays — FAQs Hard", totalProblems: 10, month: 1, week: 2 },
  { name: "Sorting", totalProblems: 8, month: 1, week: 2 },
  { name: "Binary Search — Fundamentals", totalProblems: 8, month: 1, week: 3 },
  { name: "Binary Search — Logic Building", totalProblems: 12, month: 1, week: 3 },
  { name: "Binary Search — On Answers", totalProblems: 10, month: 1, week: 3 },
  { name: "Binary Search — FAQs", totalProblems: 12, month: 1, week: 4 },
  { name: "Hashing — Theory + FAQs", totalProblems: 15, month: 1, week: 4 },
  { name: "2D Arrays", totalProblems: 10, month: 2, week: 5 },
  { name: "Recursion — Implementation", totalProblems: 10, month: 2, week: 5 },
  { name: "Recursion — Subsequence", totalProblems: 8, month: 2, week: 5 },
  { name: "Recursion — FAQs Medium/Hard", totalProblems: 12, month: 2, week: 6 },
  { name: "Linked List — SLL/DLL", totalProblems: 18, month: 2, week: 6 },
  { name: "Linked List — FAQs", totalProblems: 12, month: 2, week: 7 },
  { name: "Bit Manipulation", totalProblems: 15, month: 2, week: 7 },
  { name: "Greedy — Easy + Intervals", totalProblems: 15, month: 2, week: 8 },
  { name: "Greedy — Advanced", totalProblems: 10, month: 3, week: 9 },
  { name: "Sliding Window / 2 Pointer", totalProblems: 18, month: 3, week: 9 },
  { name: "Stack/Queue — Implementation", totalProblems: 10, month: 3, week: 10 },
  { name: "Monotonic Stack", totalProblems: 8, month: 3, week: 10 },
  { name: "Stack/Queue — FAQs", totalProblems: 10, month: 3, week: 11 },
  { name: "Binary Trees — Traversals", totalProblems: 12, month: 3, week: 11 },
  { name: "Binary Trees — Medium/Hard", totalProblems: 15, month: 3, week: 11 },
  { name: "BST — Theory + Medium", totalProblems: 12, month: 4, week: 13 },
  { name: "BST — FAQs", totalProblems: 8, month: 4, week: 13 },
  { name: "Heaps — Theory + FAQs", totalProblems: 12, month: 4, week: 13 },
  { name: "Graphs — BFS/DFS", totalProblems: 15, month: 4, week: 14 },
  { name: "Graphs — Shortest Path/MST", totalProblems: 12, month: 4, week: 14 },
  { name: "Graphs — Advanced", totalProblems: 10, month: 4, week: 15 },
  { name: "DP — 1D", totalProblems: 15, month: 4, week: 15 },
  { name: "DP — 2D", totalProblems: 12, month: 5, week: 17 },
  { name: "DP — Advanced", totalProblems: 10, month: 5, week: 17 },
  { name: "Tries", totalProblems: 8, month: 5, week: 17 },
  { name: "Strings (Advanced)", totalProblems: 10, month: 5, week: 18 },
  { name: "Maths", totalProblems: 8, month: 5, week: 18 },
  { name: "Revision + Contests", totalProblems: 41, month: 5, week: 19 }
].map((t, i) => ({ ...t, order: i + 1 }));

fs.writeFileSync(path.join(dataDir, 'dsa-topics.json'), JSON.stringify(topics, null, 2));

// Generate DSA problems
const problems = [];
topics.forEach(t => {
    for(let i=0; i<t.totalProblems; i++) {
        problems.push({
            topicName: t.name,
            name: `${t.name} Problem ${i+1}`,
            difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random()*3)],
            status: 'Todo'
        });
    }
});

// Pre-mark 23 as done
for(let i=0; i<23; i++) {
    problems[i].status = 'Done';
}

fs.writeFileSync(path.join(dataDir, 'dsa-problems.json'), JSON.stringify(problems, null, 2));


// 3. Syllabus Items
const syllabus = [
  { category: 'CN', title: 'M1 Foundations', phase: 1 },
  { category: 'CN', title: 'M2 Network Models', phase: 1 },
  { category: 'CN', title: 'M3 Physical/Data Link', phase: 1 },
  { category: 'DBMS', title: 'Intro, Data Models & ER', phase: 1 },
  { category: 'DBMS', title: 'Relational Model & Normalization', phase: 1 },
  { category: 'OOP', title: 'Introduction, Core Principles', phase: 1 },
  { category: 'Tech', title: 'JS Fundamentals, Functions, ES6+', phase: 1 },
  { category: 'CN', title: 'M4 Topologies/VLANs', phase: 2 },
  { category: 'DBMS', title: 'SQL & Query Optimization', phase: 2 },
  { category: 'OOP', title: 'Advanced OOP Features', phase: 2 },
  { category: 'LLD', title: 'SOLID Principles', phase: 2 },
  { category: 'Tech', title: 'Node.js, Express, REST', phase: 2 }
];
fs.writeFileSync(path.join(dataDir, 'syllabus.json'), JSON.stringify(syllabus, null, 2));

console.log("Data generated successfully");
