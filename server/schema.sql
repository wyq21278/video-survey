-- 创建提交记录表
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  respondent_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip TEXT,
  raw_json TEXT  -- 推荐：保存完整提交，便于回溯/排查
);

-- 创建预训练模型评价表
CREATE TABLE IF NOT EXISTS pretrain_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER NOT NULL,
  body_part TEXT NOT NULL,
  naturalness TEXT NOT NULL CHECK(naturalness IN ('A', 'B')),
  similarity TEXT NOT NULL CHECK(similarity IN ('A', 'B')),
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
  UNIQUE(response_id, body_part) -- 每个 response 每个部位只允许一条
);

-- 创建主模型评价表（每页 7 个视频 A-G，每个一条，包含 score + 是否 best）
CREATE TABLE IF NOT EXISTS main_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER NOT NULL,
  page INTEGER NOT NULL CHECK(page BETWEEN 2 AND 6),
  video_id TEXT NOT NULL CHECK(video_id IN ('A','B','C','D','E','F','G')),
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  is_best INTEGER NOT NULL DEFAULT 0 CHECK(is_best IN (0, 1)),
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
  UNIQUE(response_id, page, video_id) -- 防重复
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_responses_survey ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_respondent ON responses(respondent_id);
CREATE INDEX IF NOT EXISTS idx_pretrain_response ON pretrain_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_main_response ON main_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_main_page ON main_answers(page);
CREATE INDEX IF NOT EXISTS idx_main_video ON main_answers(video_id);
CREATE INDEX IF NOT EXISTS idx_main_best ON main_answers(is_best);
