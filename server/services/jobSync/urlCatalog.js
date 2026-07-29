/**
 * Stable apply / careers URLs. Prefer pages that actually load.
 * Avoid fragile keyword search deep-links and broken portals (e.g. bare nextstep.tcsapps.com).
 */
module.exports = {
  // Service
  TCS: 'https://www.tcs.com/careers',
  'TCS Digital': 'https://www.tcs.com/careers',
  'TCS Prime': 'https://www.tcs.com/careers',
  Wipro: 'https://careers.wipro.com/careers-home/',
  'Wipro WiSE': 'https://careers.wipro.com/careers-home/',
  Infosys: 'https://www.infosys.com/careers/apply.html',
  'Infosys SP': 'https://www.infosys.com/careers/apply.html',
  Cognizant: 'https://careers.cognizant.com/global/en',
  Capgemini: 'https://www.capgemini.com/careers/',
  HCLTech: 'https://www.hcltech.com/careers',
  Accenture: 'https://www.accenture.com/in-en/careers',
  'Tech Mahindra': 'https://careers.techmahindra.com/',
  LTIMindtree: 'https://www.ltimindtree.com/careers/',
  Mphasis: 'https://careers.mphasis.com/',
  IBM: 'https://www.ibm.com/careers/search',

  // Product / FAANG
  Microsoft: 'https://jobs.careers.microsoft.com/global/en/search?q=intern&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true',
  Amazon: 'https://www.amazon.jobs/en/search?base_query=SDE+Intern&loc_query=India',
  Meta: 'https://www.metacareers.com/jobs?q=intern',
  Google: 'https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineering%20Intern',
  Apple: 'https://jobs.apple.com/en-us/search?search=intern&sort=relevance',
  Flipkart: 'https://www.flipkartcareers.com/#!/',
  Swiggy: 'https://careers.swiggy.com/',
  Zomato: 'https://www.zomato.com/careers',
  Uber: 'https://www.uber.com/careers/list/?query=intern',
  Atlassian: 'https://www.atlassian.com/company/careers/all-jobs?team=Interns',
  'Goldman Sachs': 'https://www.goldmansachs.com/careers/students',
  'DE Shaw': 'https://www.deshaw.com/careers/internships',
  Adobe: 'https://careers.adobe.com/us/en/search-results?keywords=intern',
  Paytm: 'https://paytm.com/careers',
  Meesho: 'https://meesho.io/careers',
  Dream11: 'https://www.dream11.com/about-us/careers',
  Razorpay: 'https://razorpay.com/jobs/',
  CRED: 'https://careers.cred.club/',
  PhonePe: 'https://www.phonepe.com/careers/',

  // Startups with known careers
  Postman: 'https://www.postman.com/company/careers/',
  Freshworks: 'https://www.freshworks.com/company/careers/',
  BrowserStack: 'https://www.browserstack.com/careers',
  Chargebee: 'https://www.chargebee.com/careers/',
  Vercel: 'https://vercel.com/careers',
  Supabase: 'https://supabase.com/careers',
  Groww: 'https://groww.in/careers',
  Zerodha: 'https://zerodha.com/careers/',
  Zoho: 'https://careers.zohocorp.com/',

  // Platform hubs (always usable)
  'Internshala Fast Track': 'https://internshala.com/internships/software-development-internship',
  'Wellfound Remote Intern': 'https://wellfound.com/role/r/software-engineer-intern',
  'YC Work at a Startup': 'https://www.workatastartup.com/jobs',
  'Unstop Campus': 'https://unstop.com/internships',
  'AngelList Talent': 'https://wellfound.com/role/r/software-engineer-intern'
};

/** Category fallbacks when company-specific page is unknown/broken */
module.exports.PLATFORM_FALLBACKS = {
  Internshala: 'https://internshala.com/internships/software-development-internship',
  Wellfound: 'https://wellfound.com/role/r/software-engineer-intern',
  LinkedIn: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern%20India&location=India',
  Unstop: 'https://unstop.com/internships',
  Remotive: 'https://remotive.com/remote-jobs/software-dev',
  Careers: 'https://internshala.com/internships/software-development-internship',
  Aggregator: 'https://internshala.com/internships/software-development-internship',
  OpenJobNet: 'https://wellfound.com/role/r/software-engineer-intern',
  'Wellfound / LinkedIn': 'https://wellfound.com/role/r/software-engineer-intern'
};
