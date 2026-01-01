// web/src/types.ts

export type Score = 1 | 2 | 3 | 4 | 5;
export type ABChoice = 'A' | 'B';
export type VideoId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type MainPageNo = 2 | 3 | 4 | 5 | 6;

/**
 * 第1页：预训练模型评估
 * 每个部位两项维度：
 * - 自然度：A/B 二选一
 * - 相似度：A/B 二选一
 */
export interface PretrainGroupAnswer {
  part: string;              // 头部/手部/上肢/下肢
  natural?: ABChoice;        // 自然度：A 或 B
  similarity?: ABChoice;     // 相似度：A 或 B
}

export interface PretrainAnswer {
  // key 建议用 part（头部/手部/上肢/下肢）来索引
  groups: Record<string, PretrainGroupAnswer>;
}

/**
 * 第2~6页：主模型评估
 * - 7个视频（A~G）每个必须打 1~5 分
 * - 额外选择“最好 1~2 个”（A~G）
 */
export interface MainAnswer {
  // videoId（A~G） -> 分数（1~5）
  scores: Partial<Record<VideoId, Score>>;

  // 最好视频的选择（A~G），长度 1~2
  best: VideoId[];
}

/**
 * 整份问卷答案（前端内存中的结构）
 */
export interface SurveyAnswers {
  respondent_id: string;
  survey_id: string;

  pretrain: PretrainAnswer;

  // key: 页码（2~6）
  main: Partial<Record<MainPageNo, MainAnswer>>;
}

/**
 * 提交给后端的 payload
 * 后端建议：既保存 raw_json，也拆表存结构化数据。
 */
export interface SubmitPayload {
  survey_id: string;
  respondent_id: string;

  submitted_at?: string;

  pretrain: PretrainAnswer;

  main: Partial<Record<MainPageNo, MainAnswer>>;

  // 可选：方便排查问题（不涉及隐私敏感时）
  client?: {
    user_agent?: string;
    timezone?: string;
    language?: string;
  };
}

/**
 * 后端返回结构（可选）
 */
export interface SubmitResponse {
  ok: boolean;
  error?: string;
  response_id?: number;
}
