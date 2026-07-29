const INTERN_RE = /intern|internship|graduate|new.?grad|university|campus|junior|entry.?level|trainee/i;

async function fetchJson(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'InterviewCommandCenter/1.0' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function pickInternJobs(jobs) {
  const filtered = jobs.filter((j) => INTERN_RE.test(j.title || ''));
  return (filtered.length ? filtered : jobs).slice(0, 5);
}

async function fetchGreenhouse(slug) {
  const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`);
  const jobs = (data.jobs || []).map((j) => ({
    title: j.title,
    url: j.absolute_url,
    location: j.location?.name || ''
  }));
  return pickInternJobs(jobs);
}

async function fetchLever(slug) {
  const data = await fetchJson(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  const jobs = (Array.isArray(data) ? data : []).map((j) => ({
    title: j.text,
    url: j.hostedUrl || j.applyUrl,
    location: j.categories?.location || ''
  }));
  return pickInternJobs(jobs);
}

async function fetchAshby(slug) {
  const data = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
  const jobs = (data.jobs || []).map((j) => ({
    title: j.title,
    url: j.jobUrl || j.applyUrl,
    location: j.location || ''
  }));
  return pickInternJobs(jobs);
}

async function fetchRemotive() {
  const data = await fetchJson('https://remotive.com/api/remote-jobs?category=software-dev');
  const jobs = (data.jobs || [])
    .filter((j) => INTERN_RE.test(j.title || '') || /junior|entry/i.test(j.title || ''))
    .slice(0, 30)
    .map((j) => ({
      title: j.title,
      url: j.url,
      location: j.candidate_required_location || 'Remote',
      companyName: j.company_name
    }));
  return jobs;
}

module.exports = {
  fetchGreenhouse,
  fetchLever,
  fetchAshby,
  fetchRemotive,
  INTERN_RE
};
