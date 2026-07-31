/**
 * Personal match scoring for Ayush Panda — portfolio-first startups now,
 * product/FAANG later. Boosts roles that fit shipped fullstack + AI work.
 * Portfolio: https://ayushdev-five.vercel.app/
 */

const STACK_KEYWORDS = [
  'react', 'next', 'next.js', 'node', 'node.js', 'typescript', 'javascript',
  'postgres', 'postgresql', 'mongo', 'mongodb', 'redis', 'socket', 'socket.io',
  'docker', 'kafka', 'trpc', 'prisma', 'drizzle', 'express', 'fullstack',
  'full-stack', 'full stack', 'frontend', 'front-end', 'backend', 'back-end',
  'mern', 'sde', 'software engineer', 'software developer', 'web developer',
  'intern', 'internship', 'ai', 'llm', 'openai', 'gemini', 'realtime', 'real-time'
];

const PROJECT_SIGNAL = [
  'ai', 'agent', 'gmail', 'form', 'saas', 'kanban', 'github', 'pr review',
  'polling', 'quiz', 'analytics', 'delivery', 'workflow'
];

const STARTUP_BOOST_ROLES = [
  'full stack', 'fullstack', 'frontend', 'backend', 'sde intern',
  'software engineer intern', 'web', 'product engineer', 'founding engineer'
];

function textBlob(company) {
  const roles = (company.openRoles || []).map((r) => `${r.title || ''} ${r.location || ''}`).join(' ');
  return `${company.name || ''} ${company.role || ''} ${company.platform || ''} ${company.notes || ''} ${roles}`.toLowerCase();
}

function scoreHits(text, keywords) {
  let hits = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) hits += 1;
  }
  return hits;
}

/**
 * Recompute matchScore 0–100 for a company document (plain object or mongoose doc).
 */
function computePortfolioMatch(company) {
  const text = textBlob(company);
  const category = company.category || 'Startup';
  const stackHits = scoreHits(text, STACK_KEYWORDS);
  const projectHits = scoreHits(text, PROJECT_SIGNAL);
  const roleHits = scoreHits(text, STARTUP_BOOST_ROLES);

  let score = 35;
  score += Math.min(30, stackHits * 4);
  score += Math.min(15, projectHits * 5);
  score += Math.min(10, roleHits * 3);

  if (category === 'Startup') score += 12;
  else if (category === 'Product') score += 6;
  else if (category === 'FAANG') score += 4;
  else if (category === 'Service') score += 2;

  if (company.isOpen) score += 8;
  if (company.urlStatus === 'ok') score += 3;
  if (company.urlStatus === 'broken') score -= 10;

  // Remote / India friendly soft signal
  if (/remote|india|bengaluru|bangalore|hyderabad|pune|delhi|gurgaon|noida/.test(text)) {
    score += 4;
  }

  // Deadline urgency: sooner open apps get a small bump for startups
  if (company.deadline && category === 'Startup') {
    const days = Math.ceil((new Date(company.deadline) - new Date()) / 86400000);
    if (days >= 0 && days <= 14) score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildApplyKit(company = {}) {
  const name = company.name || 'the team';
  const role = company.role || 'Software Engineer Intern';
  return {
    portfolio: 'https://ayushdev-five.vercel.app/',
    github: 'https://github.com/Ayush-Panda-design',
    email: 'pandaayush25305@gmail.com',
    resumeHint: 'Download from portfolio Resume section (ATS one-pager).',
    pitch: [
      `Hi — I'm Ayush Panda, CS @ VSSUT (5th sem, CGPA 8.27).`,
      `Applying for ${role} at ${name}.`,
      `I ship production fullstack: ShipFlow AI (Next.js/tRPC/Prisma + GitHub App AI PR review), Relvion AI (Gmail agent + pgvector), EdinForm (form SaaS), Votora (Socket.io realtime quizzes).`,
      `Portfolio: https://ayushdev-five.vercel.app/ · GitHub: https://github.com/Ayush-Panda-design`,
      `Happy to walk through architecture tradeoffs or do a take-home.`
    ].join('\n'),
    whyFit: [
      'Strong match if they want builders who ship, not only LeetCode.',
      'Lead with ShipFlow + Relvion for AI/product startups; Votora for realtime; EdinForm for SaaS.',
      'DSA: full TUF+ in progress — mention pattern fluency for OA, portfolio for culture fit.'
    ]
  };
}

module.exports = { computePortfolioMatch, buildApplyKit, STACK_KEYWORDS };
