// server/index.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// 数据文件：每行一个 JSON（jsonl）
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.jsonl');

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', function (req, res) {
  res.json({ ok: true });
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getClientIp(req) {
  var xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : null;
}

function newResponseId() {
  // Node 12 支持 crypto.randomBytes
  return 'r_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
}

function validatePayload(payload) {
  if (!payload || !payload.survey_id || !payload.respondent_id) {
    return 'missing survey_id/respondent_id';
  }
  if (!payload.pretrain || !payload.pretrain.groups) {
    return 'missing pretrain.groups';
  }
  if (!payload.main) {
    return 'missing main';
  }
  // 轻量校验：pretrain 必须 natural/similarity；main 每页 best 1-2，且 A-G 都有分数
  var groups = payload.pretrain.groups;
  for (var part in groups) {
    var g = groups[part];
    if (!g || (g.natural !== 'A' && g.natural !== 'B') || (g.similarity !== 'A' && g.similarity !== 'B')) {
      return 'pretrain incomplete: ' + part;
    }
  }

  var main = payload.main;
  var videoIds = ['A','B','C','D','E','F','G'];

  for (var pageStr in main) {
    var pageAns = main[pageStr];
    if (!pageAns || !pageAns.scores || !pageAns.best) return 'main incomplete: page ' + pageStr;

    var bestArr = pageAns.best;
    if (!Array.isArray(bestArr) || bestArr.length < 1 || bestArr.length > 2) {
      return 'best selection invalid: page ' + pageStr;
    }

    // scores: A-G 必须都有 1..5
    var scores = pageAns.scores;
    for (var i = 0; i < videoIds.length; i++) {
      var vid = videoIds[i];
      var s = scores[vid];
      if (typeof s !== 'number' || s < 1 || s > 5) {
        return 'score invalid: page ' + pageStr + ' video ' + vid;
      }
    }
  }

  return null;
}

app.post('/api/submit', function (req, res) {
  try {
    var payload = req.body;
    var err = validatePayload(payload);
    if (err) return res.status(400).json({ ok: false, error: err });

    ensureDataDir();

    var response_id = newResponseId();
    var record = {
      response_id: response_id,
      survey_id: payload.survey_id,
      respondent_id: payload.respondent_id,
      created_at: new Date().toISOString(),
      user_agent: req.headers['user-agent'] || null,
      ip: getClientIp(req),
      // 保存完整 payload，后续想迁移 SQLite 也容易
      payload: payload
    };

    fs.appendFileSync(DATA_FILE, JSON.stringify(record) + '\n', 'utf8');

    res.json({ ok: true, response_id: response_id });
  } catch (e) {
    console.error('submit error:', e);
    res.status(500).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
});

// 静态托管 dist（根目录 dist）
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', function (req, res) {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('[WARN] dist/ not found. Run web build first to serve frontend.');
}

app.listen(PORT, function () {
  console.log('Server listening on http://0.0.0.0:' + PORT);
});



// 你的真实视频目录（就是你给的那个父目录）
const REAL_VIDEO_DIR = '/home/wilson/survey/video';

// 访问前缀：浏览器用 /video/... 来取文件
app.use('/video', express.static(REAL_VIDEO_DIR));