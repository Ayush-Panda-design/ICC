/**
 * LiveHub platform entry points — primary + alternates.
 * Override any primary via env, e.g. LIVEHUB_INTERNSHALA_URL=https://...
 * Sync health-checks primary then alternates and stores the first working URL in DB.
 */
const ENV_MAP = {
  internshala: 'LIVEHUB_INTERNSHALA_URL',
  wellfound: 'LIVEHUB_WELLFOUND_URL',
  unstop: 'LIVEHUB_UNSTOP_URL',
  linkedin: 'LIVEHUB_LINKEDIN_URL',
  remotive: 'LIVEHUB_REMOTIVE_URL'
};

const HUBS = [
  {
    id: 'internshala',
    name: 'Internshala — Software Internships',
    role: 'Live board: software development internships',
    platform: 'Internshala',
    category: 'Startup',
    matchScore: 95,
    priority: 'High',
    urls: [
      'https://internshala.com/internships/software-development-internship',
      'https://internshala.com/internships/computer-science-internship',
      'https://internshala.com/internships/'
    ]
  },
  {
    id: 'wellfound',
    name: 'Wellfound — SWE Intern roles',
    role: 'Live board: software engineer intern',
    platform: 'Wellfound',
    category: 'Startup',
    matchScore: 93,
    priority: 'High',
    urls: [
      'https://wellfound.com/role/r/software-engineer-intern',
      'https://wellfound.com/role/l/software-engineer',
      'https://wellfound.com/jobs'
    ]
  },
  {
    id: 'unstop',
    name: 'Unstop — Internships',
    role: 'Live campus & off-campus internships',
    platform: 'Unstop',
    category: 'Service',
    matchScore: 90,
    priority: 'High',
    urls: [
      'https://unstop.com/internships',
      'https://unstop.com/jobs',
      'https://unstop.com/'
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn — Intern India',
    role: 'Live LinkedIn intern search (India)',
    platform: 'LinkedIn',
    category: 'Startup',
    matchScore: 88,
    priority: 'High',
    urls: [
      'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=India&f_E=1',
      'https://www.linkedin.com/jobs/search/?keywords=software%20intern&location=India',
      'https://www.linkedin.com/jobs/'
    ]
  },
  {
    id: 'remotive',
    name: 'Remotive — Software Dev',
    role: 'Live remote software jobs',
    platform: 'Remotive',
    category: 'Startup',
    matchScore: 85,
    priority: 'Medium',
    urls: [
      'https://remotive.com/remote-jobs/software-dev',
      'https://remotive.com/remote-jobs',
      'https://remotive.com/'
    ]
  }
];

function resolveHubUrls(hub) {
  const envKey = ENV_MAP[hub.id];
  const fromEnv = envKey && process.env[envKey] ? process.env[envKey].trim() : null;
  const list = [...hub.urls];
  if (fromEnv) {
    // Env primary wins; keep defaults as alternates
    return [fromEnv, ...list.filter((u) => u !== fromEnv)];
  }
  return list;
}

function getLiveHubDefinitions() {
  return HUBS.map((hub) => ({
    ...hub,
    urls: resolveHubUrls(hub),
    primaryUrl: resolveHubUrls(hub)[0]
  }));
}

/** Internshala keyword board for a company name (stable listing filter, not LinkedIn search). */
function internshalaCompanyUrl(companyName) {
  const keywords = encodeURIComponent(String(companyName || '').replace(/\s+/g, ' ').trim());
  return `https://internshala.com/internships/keywords-${keywords}`;
}

function wellfoundSearchUrl(companyName) {
  const q = encodeURIComponent(String(companyName || '').trim());
  return `https://wellfound.com/jobs?q=${q}`;
}

module.exports = {
  getLiveHubDefinitions,
  internshalaCompanyUrl,
  wellfoundSearchUrl,
  PLATFORM_HUB_PRIMARY: {
    Internshala: 'https://internshala.com/internships/software-development-internship',
    Wellfound: 'https://wellfound.com/role/r/software-engineer-intern',
    Unstop: 'https://unstop.com/internships',
    LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=India&f_E=1',
    Remotive: 'https://remotive.com/remote-jobs/software-dev'
  }
};
