import React from 'react';
import type { MainPageConfig } from '../surveyConfig';
import type { MainAnswer, Score, VideoId } from '../types';

interface MainPageProps {
  config: MainPageConfig;
  answer?: MainAnswer;
  onUpdateScore: (videoId: VideoId, score: Score) => void;
  onUpdateBest: (videoId: VideoId, checked: boolean) => void;
  disabled?: boolean;
}

const MainPage: React.FC<MainPageProps> = ({
  config,
  answer,
  onUpdateScore,
  onUpdateBest,
  disabled = false
}) => {
  const scores = answer?.scores || {};
  const best = answer?.best || [];

  const handleBestChange = (videoId: VideoId, checked: boolean) => {
    if (disabled) return;

    if (checked && best.length >= 2) {
      alert('最多只能选择2个视频');
      return;
    }
    onUpdateBest(videoId, checked);
  };

  const renderLyrics = () => {
    if (!config.lyrics) return null;

    // 如果没提供 highlightWord，就直接显示整句
    if (!config.highlightWord) {
      return (
        <div className="lyrics-section">
          <strong className="red-bold">歌词：</strong>
          {config.lyrics}
        </div>
      );
    }

    const parts = config.lyrics.split(config.highlightWord);

    return (
      <div className="lyrics-section">
        <strong className="red-bold">歌词：</strong>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <strong>{config.highlightWord}</strong>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="main-page">
      <div className="page-subtitle">
        <strong>待评价模型：</strong>动作合成模型
      </div>

      <div className="instructions">
        <p>
          <strong>要求：</strong>每一页的7个视频展示了同一歌声音频条件下，<br />
          不同方法生成的唱歌视频，<br />
          请首先对每个视频按1-5分进行评分，<br />
          然后选出你认为的最好的1-2个视频，<br />
          <span className="underline">最少选1个，最多选2个</span>，<br />
          每一页都有不同的评估维度
        </p>

        <div className="scoring-guide">
          <div>
            <strong className="red-bold">评分指标：</strong>
            <strong className="black-bold">1=很差，2=较差，3=一般，4=较好，5=很好</strong>
          </div>
          <div>
            <strong className="red-bold">评分维度：</strong>
            <strong className="black-bold">{config.dimension}</strong>
            {config.dimensionDescription}
          </div>
        </div>
      </div>

      {renderLyrics()}

      <div className="videos-grid-horizontal">
        {config.videos.map(video => (
          <div key={video.id} className="video-block">
            <video
              src={video.video_url}
              controls
              preload="metadata"
              className="video-player-vertical-small"
            />
            <div className="video-name">{video.label}</div>

            <div className="score-circles">
              {([1, 2, 3, 4, 5] as Score[]).map(score => (
                <button
                  key={score}
                  type="button"
                  className={`score-circle ${scores[video.id] === score ? 'selected' : ''}`}
                  onClick={() => onUpdateScore(video.id, score)}
                  disabled={disabled}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="best-selection">
        <div className="best-label">请选出你认为最好的1-2个：</div>

        <div className="best-options">
          {config.videos.map(video => (
            <label key={video.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={best.includes(video.id)}
                onChange={(e) => handleBestChange(video.id, e.target.checked)}
                className="checkbox-input"
                disabled={disabled}
              />
              <span className="checkbox-text">{video.id}</span>
            </label>
          ))}
        </div>

        {/* 可选：显示当前已选数量，方便用户 */}
        <div className="best-hint">
          已选：{best.length}/2
        </div>
      </div>
    </div>
  );
};

export default MainPage;
