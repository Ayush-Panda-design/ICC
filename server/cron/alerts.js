const cron = require('node-cron');
const Company = require('../models/Company');
const { runJobSync } = require('../services/jobSync');

function daysUntil(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

async function computeDeadlineAlerts() {
  const companies = await Company.find({
    status: 'Not Applied',
    deadline: { $ne: null }
  }).sort({ deadline: 1 });

  const red = [];
  const yellow = [];
  for (const c of companies) {
    const d = daysUntil(c.deadline);
    if (d == null) continue;
    if (d <= 7) red.push(c);
    else if (d <= 14) yellow.push(c);
  }
  return { red, yellow, generatedAt: new Date() };
}

function startCronJobs(io) {
  // Every 6 hours — live job sync (platforms + ATS + Remotive)
  cron.schedule('0 */6 * * *', async () => {
    console.log('[cron] Running job sync…');
    try {
      const summary = await runJobSync(io, { repair: true, healthSample: 40 });
      console.log('[cron] Job sync done:', summary.synced, 'boards,', summary.opened, 'new openings');
    } catch (err) {
      console.error('[cron] Job sync error:', err.message);
    }
  });

  // Every 2 hours — FAANG/manual careers watch (mid-cycle opens)
  cron.schedule('10 */2 * * *', async () => {
    console.log('[cron] Careers watch (dynamic FAANG/manual)…');
    try {
      const { syncCareersWatch } = require('../services/jobSync/careersWatch');
      const { pushNotification } = require('../services/jobSync/urlRepair');
      const summary = await syncCareersWatch(io, { pushNotification });
      console.log('[cron] Careers watch:', summary.watched, 'watched,', summary.opened, 'opened,', summary.samples);
    } catch (err) {
      console.error('[cron] Careers watch error:', err.message);
    }
  });

  // Every 2 hours — URL health pass
  cron.schedule('30 */2 * * *', async () => {
    console.log('[cron] URL health check…');
    try {
      const { runUrlHealthCheck } = require('../services/jobSync');
      const summary = await runUrlHealthCheck(io, { limit: 50 });
      console.log('[cron] URL health:', summary);
    } catch (err) {
      console.error('[cron] URL health error:', err.message);
    }
  });

  // 8:00 AM IST daily deadline alerts
  cron.schedule('0 8 * * *', async () => {
    console.log('[cron] Computing daily deadline alerts…');
    try {
      const snapshot = await computeDeadlineAlerts();
      if (io) {
        io.emit('alert:daily', {
          redCount: snapshot.red.length,
          yellowCount: snapshot.yellow.length,
          red: snapshot.red.slice(0, 10),
          yellow: snapshot.yellow.slice(0, 10),
          generatedAt: snapshot.generatedAt
        });
        if (snapshot.red.length) {
          io.emit('alert:deadline', {
            severity: 'RED',
            count: snapshot.red.length,
            top: snapshot.red[0]
          });
        }
      }
      console.log('[cron] Alerts — RED:', snapshot.red.length, 'YELLOW:', snapshot.yellow.length);
    } catch (err) {
      console.error('[cron] Alert error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // 9:00 AM IST — coach / accountability pass (missed days, streak, behind checkpoint)
  cron.schedule('0 9 * * *', async () => {
    console.log('[cron] Running coach evaluation…');
    try {
      const { getCoachToday } = require('../services/coach');
      const payload = await getCoachToday({ persist: true });
      if (io) {
        io.emit('coach:daily', {
          messages: payload.messages,
          stats: payload.stats,
          generatedAt: new Date()
        });
        for (const m of payload.messages) {
          if (m.type === 'missed_day' || m.type === 'streak_break' || m.type === 'behind_checkpoint') {
            io.emit('coach:alert', m);
          }
        }
      }
      console.log('[cron] Coach:', payload.messages.map((m) => m.type).join(', ') || 'none', '| created', payload.notificationsCreated);
    } catch (err) {
      console.error('[cron] Coach error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // 8:15 AM IST — refresh Notice Board AI hiring brief
  cron.schedule('15 8 * * *', async () => {
    console.log('[cron] Refreshing notice hiring brief…');
    try {
      const { getNoticeBoard } = require('../services/notices');
      const board = await getNoticeBoard({ forceBrief: true, limit: 40 });
      if (io) {
        io.emit('notice:brief', {
          headline: board.brief?.headline,
          asOf: board.brief?.asOf,
          openCount: board.openings?.filter((o) => o.isOpen).length || 0
        });
      }
      console.log('[cron] Notice brief:', board.brief?.source, board.brief?.headline?.slice(0, 60));
    } catch (err) {
      console.error('[cron] Notice brief error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('Cron jobs scheduled (sync 6h, careers watch 2h, url health 2h, daily alerts 8:00 IST, coach 9:00 IST, notices 8:15 IST)');
}

module.exports = { startCronJobs, computeDeadlineAlerts };
