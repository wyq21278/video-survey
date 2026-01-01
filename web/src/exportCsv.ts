// web/src/exportCsv.ts
import type { SurveyAnswers, Score, MainPageNo,VideoId,PretrainAnswer, MainAnswer } from './types';

// 简单 CSV 转义：包含逗号/引号/换行时加双引号，并将双引号替换为两个双引号
function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/**
 * 将整份问卷答案导出为“长表（long format）”CSV：
 * - 每一行是一条评价记录
 * - 便于后续统计/透视表/脚本分析
 */
export function buildSurveyCsv(ans: SurveyAnswers): string {
  const lines: string[] = [];

  lines.push(
    [
      'survey_id',
      'respondent_id',
      'submitted_at',
      'section',
      'page',
      'item',
      'metric',
      'value'
    ].map(csvEscape).join(',')
  );

  const submittedAt = new Date().toISOString();

  // ===== pretrain（第1页）=====
  if (ans.pretrain && ans.pretrain.groups) {
    const groups = ans.pretrain.groups;
    for (const part of Object.keys(groups)) {
      const g = groups[part];
      lines.push([
        ans.survey_id,
        ans.respondent_id,
        submittedAt,
        'pretrain',
        1,
        part,
        'naturalness',
        g.natural || ''
      ].map(csvEscape).join(','));

      lines.push([
        ans.survey_id,
        ans.respondent_id,
        submittedAt,
        'pretrain',
        1,
        part,
        'similarity',
        g.similarity || ''
      ].map(csvEscape).join(','));
    }
  }

  // ===== main（第2~6页）：用固定页码遍历，避免 string 索引类型问题 =====
  const pages: MainPageNo[] = [2, 3, 4, 5, 6];
  const allVids: VideoId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  if (ans.main) {
    for (const page of pages) {
      const m = ans.main[page];
      if (!m) continue;

      // scores
      for (const vid of allVids) {
        const score = m.scores[vid];
        lines.push([
          ans.survey_id,
          ans.respondent_id,
          submittedAt,
          'main',
          page,
          vid,
          'score',
          score ?? ''
        ].map(csvEscape).join(','));
      }

      // is_best
      const bestSet = new Set(m.best || []);
      for (const vid of allVids) {
        lines.push([
          ans.survey_id,
          ans.respondent_id,
          submittedAt,
          'main',
          page,
          vid,
          'is_best',
          bestSet.has(vid) ? 1 : 0
        ].map(csvEscape).join(','));
      }
    }
  }

  return lines.join('\n');
}
