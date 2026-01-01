// web/src/components/PretrainPage.tsx
import React from 'react';
import type { PretrainAnswer, ABChoice } from '../types';
import type { PretrainPageConfig } from '../surveyConfig';

interface PretrainPageProps {
  config: PretrainPageConfig;
  answer: PretrainAnswer;
  onChange: (part: string, field: 'natural' | 'similarity', value: ABChoice) => void;
  disabled?: boolean;
}

const PretrainPage: React.FC<PretrainPageProps> = ({ config, answer, onChange, disabled }) => {
  return (
    <div className="pretrain-page">
      <div className="page-subtitle">
        <strong>待评价模型：</strong>预训练模型
      </div>

      <div className="instructions">
        <p>
          <strong>要求：</strong>
          以下视频分为头部、手部、上肢、下肢四组，分别对应不同的身体部分，
          每组给出1个参考视频和2个预训练后的视频，请在2个预训练视频中
          <span className="red-text">选出你认为更好的一个</span>，评价维度如下：
        </p>
        <p>
          <strong className="red-bold">自然度：</strong>
          视频中人物动作流畅自然不卡顿、更像真人在唱歌
        </p>
        <p>
          <strong className="red-bold">相似度：</strong>
          视频中人物动作与参考视频更为相似
        </p>
      </div>

      {config.groups.map(group => {
        const gAns = answer.groups[group.part] ?? { part: group.part };

        return (
          <div key={group.part} className="pretrain-group">
            <div className="group-title">
              <strong>部位：</strong>{group.part}
            </div>

            <div className="videos-row">
              <div className="video-col">
                <video
                  src={group.reference_video}
                  controls
                  preload="metadata"
                  className="video-player-vertical-small"
                />
                <div className="video-caption">参考视频</div>
              </div>

              <div className="video-col">
                <video
                  src={group.videoA}
                  controls
                  preload="metadata"
                  className="video-player-vertical-small"
                />
                <div className="video-caption">训练后视频A</div>
              </div>

              <div className="video-col">
                <video
                  src={group.videoB}
                  controls
                  preload="metadata"
                  className="video-player-vertical-small"
                />
                <div className="video-caption">训练后视频B</div>
              </div>
            </div>

            <div className="ab-table">
              <div className="ab-header">
                <div className="ab-cell ab-metric" />
                <div className="ab-cell ab-option">视频A</div>
                <div className="ab-cell ab-option">视频B</div>
              </div>

              <div className="ab-row">
                <div className="ab-cell ab-metric">自然度</div>
                <div className="ab-cell ab-option">
                  <input
                    type="radio"
                    name={`${group.part}-natural`}
                    checked={gAns.natural === 'A'}
                    disabled={disabled}
                    onChange={() => onChange(group.part, 'natural', 'A')}
                  />
                </div>
                <div className="ab-cell ab-option">
                  <input
                    type="radio"
                    name={`${group.part}-natural`}
                    checked={gAns.natural === 'B'}
                    disabled={disabled}
                    onChange={() => onChange(group.part, 'natural', 'B')}
                  />
                </div>
              </div>

              <div className="ab-row">
                <div className="ab-cell ab-metric">相似度</div>
                <div className="ab-cell ab-option">
                  <input
                    type="radio"
                    name={`${group.part}-similarity`}
                    checked={gAns.similarity === 'A'}
                    disabled={disabled}
                    onChange={() => onChange(group.part, 'similarity', 'A')}
                  />
                </div>
                <div className="ab-cell ab-option">
                  <input
                    type="radio"
                    name={`${group.part}-similarity`}
                    checked={gAns.similarity === 'B'}
                    disabled={disabled}
                    onChange={() => onChange(group.part, 'similarity', 'B')}
                  />
                </div>
              </div>
            </div>

            <div className="group-spacer" />
          </div>
        );
      })}
    </div>
  );
};

export default PretrainPage;
