/**
 * Coach / guider layer — accountability messages like paid batches.
 * Rule engine always runs; Gemini polishes tone when GEMINI_API_KEY is set.
 */
const DailyTask = require('../../models/DailyTask');
const DSAProblem = require('../../models/DSAProblem');
const UserProgress = require('../../models/UserProgress');
const WeeklyCheckpoint = require('../../models/WeeklyCheckpoint');
const Notification = require('../../models/Notification');

const CORE_KEYS = ['dsa', 'coreCS', 'techRevision', 'application'];

function startOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function daysBetween(a, b) {
  return Math.floor((startOfDayUTC(b) - startOfDayUTC(a)) / 86400000);
}

async function findTaskForDay(day) {
  return DailyTask.findOne({ date: { $gte: startOfDayUTC(day), $lte: endOfDayUTC(day) } });
}

async function getGuideToday() {
  const now = startOfDayUTC();
  let task = await findTaskForDay(now);
  if (!task) {
    const guide = new Date(Date.UTC(2026, 6, 30));
    task = await findTaskForDay(guide);
  }
  return { now, task };
}

function taskIncomplete(task) {
  if (!task || task.isRest) return false;
  const done = new Set(task.completed || []);
  return !CORE_KEYS.every((k) => done.has(k));
}

function missedDsa(task) {
  if (!task || task.isRest) return false;
  return !(task.completed || []).includes('dsa');
}

async function evaluateCoachState() {
  const progress = await UserProgress.findOne();
  const { now, task: todayTask } = await getGuideToday();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayTask = await findTaskForDay(yesterday);

  const dsaDone = await DSAProblem.countDocuments({ status: 'Done' });
  const weekNum = todayTask?.weekNumber || 1;
  const checkpoint = await WeeklyCheckpoint.findOne({ weekNumber: weekNum });
  const dsaTarget = checkpoint?.dsaTarget || 0;
  const dsaGap = Math.max(0, dsaTarget - dsaDone);

  const lastActive = progress?.lastActiveDate ? startOfDayUTC(progress.lastActiveDate) : null;
  const idleDays = lastActive ? daysBetween(lastActive, now) : 999;
  const streak = progress?.streak || 0;

  const missedYesterday = Boolean(yesterdayTask && !yesterdayTask.isRest && taskIncomplete(yesterdayTask));
  const skippedDsaYesterday = Boolean(yesterdayTask && missedDsa(yesterdayTask));
  const streakBroken = idleDays >= 2 || (missedYesterday && streak === 0 && idleDays >= 1);
  const behindCheckpoint = dsaGap > 15;
  const todayIncomplete = Boolean(todayTask && !todayTask.isRest && taskIncomplete(todayTask));
  const onTrack = !behindCheckpoint && !missedYesterday && idleDays < 2;

  const facts = {
    streak,
    idleDays,
    dsaDone,
    dsaTarget,
    dsaGap,
    weekNum,
    theme: todayTask?.theme || checkpoint?.theme || '',
    missedYesterday,
    skippedDsaYesterday,
    streakBroken,
    behindCheckpoint,
    todayIncomplete,
    onTrack,
    todayFocus: todayTask?.dsaFocus || '',
    isRestToday: Boolean(todayTask?.isRest)
  };

  const ruleMessages = buildRuleMessages(facts);
  return { facts, ruleMessages, progress, todayTask, checkpoint };
}

function buildRuleMessages(facts) {
  const msgs = [];

  if (facts.skippedDsaYesterday || facts.missedYesterday) {
    msgs.push({
      type: 'missed_day',
      title: 'You left practice mid-path',
      body:
        'This is not how people who crack top companies operate. You skipped yesterday\'s plan. ' +
        'Open today\'s Daily Planner and finish DSA first — consistency beats talent.'
    });
  }

  if (facts.streakBroken && facts.idleDays >= 2) {
    msgs.push({
      type: 'streak_break',
      title: 'Streak broken — recover today',
      body:
        `You went quiet for ${facts.idleDays} days. Best candidates treat prep like a job. ` +
        'Do today\'s DSA block before anything else and restart the streak.'
    });
  }

  if (facts.behindCheckpoint) {
    msgs.push({
      type: 'behind_checkpoint',
      title: `Behind checkpoint by ${facts.dsaGap} problems`,
      body:
        `Week ${facts.weekNum} target is ${facts.dsaTarget}/480; you are at ${facts.dsaDone}. ` +
        (facts.theme ? `Focus: ${facts.theme}. ` : '') +
        'Add 1 extra problem today. Falling behind now costs interviews in September.'
    });
  }

  if (facts.todayIncomplete && !facts.isRestToday && msgs.length === 0) {
    msgs.push({
      type: 'coach',
      title: 'Today\'s assignments are still open',
      body:
        facts.todayFocus
          ? `Your coach check-in: finish today's DSA — ${facts.todayFocus}. Then tick Core CS and one application.`
          : 'Your coach check-in: finish today\'s DSA, Core CS, and at least one application before you log off.'
    });
  }

  if (facts.onTrack && msgs.length === 0) {
    msgs.push({
      type: 'coach',
      title: 'On track — keep the standard',
      body:
        `Streak ${facts.streak} · DSA ${facts.dsaDone}/${facts.dsaTarget || 480}. ` +
        'This is the pace that gets offers. Don\'t coast — lock today\'s block.'
    });
  }

  return msgs.slice(0, 3);
}

async function polishWithGemini(facts, ruleMessages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !ruleMessages.length) {
    return ruleMessages.map((m) => ({ ...m, source: 'rules' }));
  }

  try {
    const prompt =
      'You are a firm interview coach for a CS student targeting startups by Sep and FAANG by Dec. ' +
      'Rewrite each message to be short (max 2 sentences), motivating, tough-love when behind, never teach DSA solutions. ' +
      'Return JSON array of {type,title,body} with same types. Facts: ' +
      JSON.stringify(facts) +
      ' Messages: ' +
      JSON.stringify(ruleMessages);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 512 }
      })
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('Empty Gemini array');
    return parsed.slice(0, 3).map((m, i) => ({
      type: m.type || ruleMessages[i]?.type || 'coach',
      title: m.title || ruleMessages[i]?.title || 'Coach',
      body: m.body || ruleMessages[i]?.body || '',
      source: 'gemini'
    }));
  } catch (err) {
    console.warn('[coach] Gemini fallback to rules:', err.message);
    return ruleMessages.map((m) => ({ ...m, source: 'rules' }));
  }
}

async function persistCoachNotifications(messages, { force = false } = {}) {
  const since = new Date(Date.now() - 20 * 60 * 60 * 1000); // avoid spam within ~20h
  const created = [];
  for (const m of messages) {
    if (!force) {
      const existing = await Notification.findOne({
        type: m.type,
        title: m.title,
        createdAt: { $gte: since }
      });
      if (existing) continue;
    }
    const doc = await Notification.create({
      type: m.type,
      title: m.title,
      body: m.body,
      meta: { source: m.source || 'rules', coach: true }
    });
    created.push(doc);
  }
  return created;
}

/**
 * Full coach evaluation for API + cron.
 */
async function getCoachToday({ persist = false, forcePersist = false } = {}) {
  const { facts, ruleMessages, todayTask, checkpoint } = await evaluateCoachState();
  const messages = await polishWithGemini(facts, ruleMessages);
  let notifications = [];
  if (persist) {
    notifications = await persistCoachNotifications(messages, { force: forcePersist });
  }
  return {
    messages,
    stats: {
      streak: facts.streak,
      idleDays: facts.idleDays,
      dsaDone: facts.dsaDone,
      dsaTarget: facts.dsaTarget,
      dsaGap: facts.dsaGap,
      weekNumber: facts.weekNum,
      missedYesterday: facts.missedYesterday,
      streakBroken: facts.streakBroken,
      behindCheckpoint: facts.behindCheckpoint,
      onTrack: facts.onTrack,
      todayIncomplete: facts.todayIncomplete,
      theme: facts.theme,
      geminiEnabled: Boolean(process.env.GEMINI_API_KEY)
    },
    todayTask: todayTask
      ? { dayLabel: todayTask.dayLabel, dsaFocus: todayTask.dsaFocus, completed: todayTask.completed, isRest: todayTask.isRest }
      : null,
    checkpoint: checkpoint
      ? { weekNumber: checkpoint.weekNumber, dsaTarget: checkpoint.dsaTarget, theme: checkpoint.theme }
      : null,
    notificationsCreated: notifications.length
  };
}

module.exports = {
  getCoachToday,
  evaluateCoachState,
  buildRuleMessages
};
