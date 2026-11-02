// Local, read-only HTTP benchmark with an isolated synthetic database.
// Build server first. Build a separate client copy with BACKEND_API_URL pointing
// to http://127.0.0.1:4100/api/v1, then pass its path as the first argument.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const serverRoot = path.resolve(__dirname, '..');
const clientRoot = path.resolve(process.argv[2] || '/tmp/hirenova-loadtest-client');
const output = path.resolve(process.argv[3] || '/tmp/hirenova-load-test.json');
const dbName = `hirenova_loadtest_${Date.now()}`;
const children = [];
const logs = [];
const agent = new http.Agent({ keepAlive: true, maxSockets: 160 });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const samples = [];
let sampleTimer;

function start(name, command, args, cwd, overrides) {
  const log = fs.openSync(`/tmp/hirenova-loadtest-${name}.log`, 'w');
  logs.push(log);
  const child = spawn(command, args, {
    cwd, env: { ...process.env, ...overrides }, stdio: ['ignore', log, log],
  });
  children.push(child);
  return child;
}

function request(port, route, validate = () => true) {
  return new Promise(resolve => {
    const began = performance.now();
    const req = http.get({ host: '127.0.0.1', port, path: route, agent }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', part => { body += part; });
      res.on('end', () => {
        let valid = false;
        try { valid = validate(body); } catch {}
        resolve({ ms: performance.now() - began, status: res.statusCode,
          ok: res.statusCode === 200 && valid });
      });
      res.on('error', () => resolve({ ms: performance.now() - began, status: 'response_error', ok: false }));
    });
    req.setTimeout(10000, () => req.destroy(new Error('timeout')));
    req.on('error', () => resolve({ ms: performance.now() - began, status: 'connection_error', ok: false }));
  });
}

async function ready(port, route) {
  for (let i = 0; i < 90; i++) {
    if ((await request(port, route)).ok) return;
    if (children.some(child => child.exitCode !== null)) throw new Error('Test process exited; inspect /tmp/hirenova-loadtest-*.log');
    await pause(500);
  }
  throw new Error(`Port ${port} did not become ready`);
}

function processSample(pid) {
  try {
    const text = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    const stat = text.slice(text.lastIndexOf(')') + 2).split(' ');
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    return { pid, cpuTicks: Number(stat[11]) + Number(stat[12]),
      rssMiB: Number(status.match(/VmRSS:\s+(\d+)/)?.[1] || 0) / 1024 };
  } catch { return { pid, rssMiB: 0, cpuTicks: 0 }; }
}

function percentile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  return Number(sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)].toFixed(1));
}

async function phase(label, concurrency, routes, seconds = 15) {
  const results = [];
  let index = 0;
  const began = performance.now();
  const until = began + seconds * 1000;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (performance.now() < until) {
      const route = routes[index++ % routes.length];
      const result = await request(...route);
      results.push({ ...result, route: route[1] });
    }
  }));
  const duration = (performance.now() - began) / 1000;
  const latencies = results.map(result => result.ms);
  const summarize = rows => ({ requests: rows.length, errors: rows.filter(r => !r.ok).length,
    p50Ms: percentile(rows.map(r => r.ms), .5), p95Ms: percentile(rows.map(r => r.ms), .95),
    p99Ms: percentile(rows.map(r => r.ms), .99) });
  const row = { label, concurrency, seconds: Number(duration.toFixed(2)), ...summarize(results),
    rps: Number((results.length / duration).toFixed(1)), maxMs: Math.round(Math.max(...latencies)),
    statuses: results.reduce((out, r) => { out[r.status] = (out[r.status] || 0) + 1; return out; }, {}),
    routes: Object.fromEntries([...new Set(results.map(r => r.route))].map(route => [route, summarize(results.filter(r => r.route === route))])) };
  console.log(JSON.stringify(row));
  return row;
}

(async () => {
  const report = { timestamp: new Date().toISOString(), database: dbName,
    host: { cpu: os.cpus()[0].model, logicalCpus: os.cpus().length,
      totalRamGiB: Number((os.totalmem() / 2 ** 30).toFixed(2)), load: os.loadavg() },
    mode: 'production builds, isolated DB, rate limits disabled in test API only, closed-loop keepalive HTTP',
    dataset: { jobs: 5000, employers: 100 }, phases: [] };
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION_URL, { dbName, serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;
    const employers = Array.from({ length: 100 }, (_, i) => ({ _id: new mongoose.Types.ObjectId(),
      username: `loadtest_employer_${i}`, email: `loadtest${i}@example.invalid`, role: 'employer', status: 'active', companyName: `Test Company ${i}` }));
    await db.collection('users').insertMany(employers);
    const titles = ['Senior React Developer', 'Backend Node Engineer', 'Full Stack Developer', 'Product Designer', 'DevOps Engineer'];
    const jobs = Array.from({ length: 5000 }, (_, i) => ({ _id: new mongoose.Types.ObjectId(),
      title: `${titles[i % titles.length]} ${i}`, description: 'Synthetic benchmark job. '.repeat(50),
      author: employers[i % 100]._id, location: ['Dhaka', 'Remote', 'Chattogram'][i % 3],
      jobType: ['full-time', 'remote', 'contract'][i % 3], skillsRequired: ['React', 'Node.js', 'TypeScript'],
      experienceRequired: i % 6, experienceMin: i % 6, experienceMax: i % 6 + 3,
      salary: 30000 + i % 100 * 1000, status: 'open', approvalStatus: 'approved',
      createdAt: new Date(Date.now() - i * 60000), expiresAt: new Date(Date.now() + 90 * 86400000) }));
    await db.collection('jobs').insertMany(jobs);
    const api = start('api', process.execPath, ['dist/index.js'], serverRoot, {
      NODE_ENV: 'production', DB_NAME: dbName, PORT: '4100', DISABLE_RATE_LIMITS: 'true',
      RATE_LIMIT_STORE: 'redis', OPENROUTER_API_KEY: '', ERROR_WEBHOOK_URL: '',
    });
    await ready(4100, '/health/ready');
    const web = start('web', process.execPath, [path.join(serverRoot, '../client/node_modules/next/dist/bin/next'), 'start', '-p', '3100', '-H', '127.0.0.1'], clientRoot, {
      NODE_ENV: 'production', BACKEND_API_URL: 'http://127.0.0.1:4100/api/v1', NEXT_TELEMETRY_DISABLED: '1',
    });
    await ready(3100, '/about');
    sampleTimer = setInterval(() => samples.push({ time: Date.now(), api: processSample(api.pid), web: processSample(web.pid), load: os.loadavg()[0] }), 1000);
    const listValid = body => { const data = JSON.parse(body); return data.data.length > 0 && data.pagination.totalItems > 0; };
    const detailValid = body => JSON.parse(body).data.id === String(jobs[0]._id);
    const htmlValid = body => body.includes('</html>');
    const apiRoutes = [
      [4100, '/api/v1/jobs?limit=10&page=1&sort_by=createdAt&sort_type=dsc', listValid],
      [4100, '/api/v1/jobs?limit=10&page=3&search=React&location=Dhaka', listValid],
      [4100, `/api/v1/jobs/${jobs[0]._id}`, detailValid],
    ];
    const webRoutes = [[3100, '/about', htmlValid], [3100, '/jobs?search=React', body => htmlValid(body) && body.includes('Senior React Developer')],
      [3100, '/api/v1/jobs?limit=10&page=1', listValid]];
    for (const route of [...apiRoutes, ...webRoutes]) {
      if (!(await request(...route)).ok) throw new Error(`Preflight failed: ${route[1]}`);
    }
    await phase('warmup-api', 5, apiRoutes, 5);
    await phase('warmup-web', 3, webRoutes, 5);
    for (const concurrency of [10, 25, 50, 100]) {
      report.phases.push(await phase('api', concurrency, apiRoutes));
      report.phases.push(await phase('web', concurrency, webRoutes));
    }
    report.resources = { peakApiRssMiB: Math.round(Math.max(...samples.map(s => s.api.rssMiB))),
      peakWebRssMiB: Math.round(Math.max(...samples.map(s => s.web.rssMiB))), samples };
  } finally {
    clearInterval(sampleTimer);
    agent.destroy();
    for (const child of children) child.kill('SIGTERM');
    await Promise.all(children.map(child => child.exitCode !== null ? Promise.resolve() : new Promise(resolve => {
      child.once('exit', resolve);
      setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 5000).unref();
    })));
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    for (const fd of logs) fs.closeSync(fd);
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(`Report: ${output}; isolated database removed.`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
