/**
 * Custom Playwright Reporter — Updates QA Tracker in real-time
 * Activate: TRACKER_FILE=/path/to/tracker.html npx playwright test
 */
import fs from 'fs';

class TrackerReporter {
  constructor() {
    this.stateFile = process.env.TRACKER_FILE?.replace('.html', '-state.json');
    this.state = {};
    if (this.stateFile && fs.existsSync(this.stateFile)) {
      try { this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8')); } catch {}
    }
  }

  onTestBegin(test) {
    const id = this._extractId(test.title);
    if (id) {
      this.state[id] = {status: 'testing', note: '', updatedAt: new Date().toISOString()};
      this._save();
    }
  }

  onTestEnd(test, result) {
    const id = this._extractId(test.title);
    if (!id) return;

    let status, note;
    if (result.status === 'passed') {
      status = 'done';
      note = '';
    } else if (result.status === 'failed') {
      status = 'block';
      note = result.error?.message?.slice(0, 200) || 'Failed';
    } else {
      status = 'pending';
      note = 'Skipped';
    }

    this.state[id] = {status, note, updatedAt: new Date().toISOString()};
    this._save();
  }

  _extractId(title) {
    return title.match(/(\d+\.\d+)/)?.[1] || title.match(/(TC-\d+\.\d+)/)?.[1] || title.match(/(UI-\d+\.\d+)/)?.[1];
  }

  _save() {
    if (this.stateFile) {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }
  }
}

export default TrackerReporter;
