/**
 * Tracker Helper — Read/write QA tracker state
 * Used by both custom reporter and test scripts
 */
import fs from 'fs';

const TRACKER_FILE = process.env.TRACKER_FILE || '';
const STATE_FILE = TRACKER_FILE ? TRACKER_FILE.replace('.html', '-state.json') : '';

export function readTrackerState() {
  if (!STATE_FILE || !fs.existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function writeTrackerState(state) {
  if (!STATE_FILE) return;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function updateTracker(caseId, status, note = '') {
  const state = readTrackerState();
  state[caseId] = {status, note, updatedAt: new Date().toISOString()};
  writeTrackerState(state);
}

export function batchUpdateTracker(updates) {
  const state = readTrackerState();
  for (const u of updates) {
    state[u.id] = {status: u.status, note: u.note || '', updatedAt: new Date().toISOString()};
  }
  writeTrackerState(state);
}
