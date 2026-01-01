// web/src/App.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { surveyConfig, PageConfig, PretrainPageConfig, MainPageConfig } from './surveyConfig';
import MainPage from './components/MainPage';
import PretrainPage from './components/PretrainPage';
import './App.css';

import { buildSurveyCsv, downloadCsv } from './exportCsv';
import type {
  MainAnswer,
  PretrainAnswer,
  Score,
  VideoId,
  MainPageNo,
  SurveyAnswers
} from './types';

const LS_ANSWERS_KEY = 'survey_answers_v2';
const LS_RESPONDENT_KEY = 'respondent_id_v2';

function genRespondentId() {
  return `resp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function App() {
  const totalPages = surveyConfig.pages.length; // 6
  const [pageIndex, setPageIndex] = useState(0); // 0..5
  const currentConfig: PageConfig = surveyConfig.pages[pageIndex];

  const [respondentId] = useState(() => {
    const stored = localStorage.getItem(LS_RESPONDENT_KEY);
    if (stored) return stored;
    const newId = genRespondentId();
    localStorage.setItem(LS_RESPONDENT_KEY, newId);
    return newId;
  });

  const [pretrain, setPretrain] = useState<PretrainAnswer>({ groups: {} });
  const [main, setMain] = useState<Partial<Record<MainPageNo, MainAnswer>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ===== 恢复 localStorage =====
  useEffect(() => {
    const stored = localStorage.getItem(LS_ANSWERS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      // 兼容老数据：不用可选链，避免老环境/ts target 问题
      if (parsed && parsed.pretrain) setPretrain(parsed.pretrain);
      if (parsed && parsed.main) setMain(parsed.main);
    } catch (e) {
      console.error('Failed to parse stored answers:', e);
    }
  }, []);

  // ===== 保存 localStorage（已提交则不再保存） =====
  useEffect(() => {
    if (isSubmitted) return;
    localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify({ pretrain, main }));
  }, [pretrain, main, isSubmitted]);

  // ===== 第1页更新：A/B 单选 =====
  const updatePretrainChoice = (
    part: string,
    field: 'natural' | 'similarity',
    value: 'A' | 'B'
  ) => {
    if (isSubmitted) return;
    setPretrain(prev => ({
      groups: {
        ...prev.groups,
        [part]: {
          part,
          natural: field === 'natural' ? value : (prev.groups[part] && prev.groups[part].natural),
          similarity: field === 'similarity' ? value : (prev.groups[part] && prev.groups[part].similarity)
        }
      }
    }));
  };

  // ===== 主模型页：更新分数 =====
  const updateMainScore = (page: MainPageNo, videoId: VideoId, score: Score) => {
    if (isSubmitted) return;
    setMain(prev => {
      const cur = prev[page] || { scores: {}, best: [] };
      return {
        ...prev,
        [page]: {
          ...cur,
          scores: { ...cur.scores, [videoId]: score }
        }
      };
    });
  };

  // ===== 主模型页：更新 best（最多 2 个）=====
  const updateMainBest = (page: MainPageNo, videoId: VideoId, checked: boolean) => {
    if (isSubmitted) return;
    setMain(prev => {
      const cur = prev[page] || { scores: {}, best: [] };
      let nextBest = cur.best.slice();

      if (checked) {
        if (nextBest.indexOf(videoId) === -1) nextBest.push(videoId);
      } else {
        nextBest = nextBest.filter(x => x !== videoId);
      }

      return { ...prev, [page]: { ...cur, best: nextBest } };
    });
  };

  // ===== 校验：当前页是否完成（boolean）=====
  const isCurrentComplete = useMemo(() => {
    if (currentConfig.type === 'pretrain') {
      const cfg = currentConfig as PretrainPageConfig;
      return cfg.groups.every(g => {
        const a = pretrain.groups[g.part];
        return a && a.natural && a.similarity;
      });
    }

    const cfg = currentConfig as MainPageConfig; // page=2..6
    const a = main[cfg.page];
    if (!a) return false;

    const allScored = cfg.videos.every(v => typeof (a.scores && a.scores[v.id]) === 'number');
    if (!allScored) return false;

    return a.best.length >= 1 && a.best.length <= 2;
  }, [currentConfig, pretrain, main]);

  // ===== 校验：全部完成（boolean）=====
  const isAllComplete = useMemo(() => {
    return surveyConfig.pages.every(p => {
      if (p.type === 'pretrain') {
        const cfg = p as PretrainPageConfig;
        return cfg.groups.every(g => {
          const a = pretrain.groups[g.part];
          return a && a.natural && a.similarity;
        });
      }

      const cfg = p as MainPageConfig;
      const a = main[cfg.page];
      if (!a) return false;

      const allScored = cfg.videos.every(v => typeof (a.scores && a.scores[v.id]) === 'number');
      if (!allScored) return false;

      return a.best.length >= 1 && a.best.length <= 2;
    });
  }, [pretrain, main]);

  const goNext = () => {
    if (isSubmitted) return;
    if (!isCurrentComplete) {
      alert('请完成当前页面的所有题目后再继续');
      return;
    }
    if (pageIndex < totalPages - 1) {
      setPageIndex(i => i + 1);
      window.scrollTo(0, 0);
    }
  };

  const goPrev = () => {
    if (isSubmitted) return;
    if (pageIndex > 0) {
      setPageIndex(i => i - 1);
      window.scrollTo(0, 0);
    }
  };

  // ===== 提交：生成 CSV 并下载（不走后端）=====
  const submit = () => {
    if (isSubmitted) return;

    if (!isAllComplete) { // ✅ 注意：这里不再写 isAllComplete()
      alert('请完成所有页面后再提交');
      return;
    }

    const ok = window.confirm('确认提交问卷？提交后将自动下载结果CSV。');
    if (!ok) return;

    setIsSubmitting(true);
    try {
      const payload: SurveyAnswers = {
        survey_id: surveyConfig.survey_id,
        respondent_id: respondentId,
        pretrain: pretrain, // ✅ 用 state 值
        main: main as any   // 类型上 main 是 Partial；你已校验完整，这里可断言
      };

      const csv = buildSurveyCsv(payload);
      const filename = `survey_${payload.survey_id}_${payload.respondent_id}.csv`;
      downloadCsv(filename, csv);

      // 清空本地暂存，避免刷新后恢复旧答案
      localStorage.removeItem(LS_ANSWERS_KEY);

      alert('提交成功！CSV 已下载，请将文件发送给研究人员。');

      // 留在最后一页，并禁用所有按钮
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      alert('生成CSV失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>{surveyConfig.title}</h1>
        <div className="progress">
          第 {pageIndex + 1} / {totalPages} 页
          {isSubmitted && <span className="submitted-badge">（已提交）</span>}
        </div>
      </header>

      {currentConfig.type === 'pretrain' ? (
        <PretrainPage
          config={currentConfig as PretrainPageConfig}
          answer={pretrain}
          onChange={updatePretrainChoice}
          disabled={isSubmitted}
        />
      ) : (
        <MainPage
          config={currentConfig as MainPageConfig}
          answer={main[(currentConfig as MainPageConfig).page]}
          disabled={isSubmitted} 
          onUpdateScore={(videoId, score) =>
            updateMainScore((currentConfig as MainPageConfig).page, videoId, score)
          }
          onUpdateBest={(videoId, checked) =>
            updateMainBest((currentConfig as MainPageConfig).page, videoId, checked)
          }
        />
      )}

      <div className="footer-nav">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0 || isSubmitting || isSubmitted}
        >
          上一页
        </button>

        {pageIndex < totalPages - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting || isSubmitted}
          >
            保存并进入下一页
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting || isSubmitted}
          >
            保存并提交
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
