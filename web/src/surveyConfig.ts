import type { VideoId, MainPageNo } from './types';


export interface VideoItem {
  id: VideoId;          // 原来是 string
  video_url: string;
  label: string;
}

export interface BodyPartGroup {
  part: string;
  reference_video: string;
  videoA: string;
  videoB: string;
}

export interface PretrainPageConfig {
  type: 'pretrain';
  groups: BodyPartGroup[];
}

export interface MainPageConfig {
  type: 'main';
  page: MainPageNo;
  dimension: string;
  dimensionDescription: string;
  videos: VideoItem[];
  lyrics?: string;
  highlightWord?: string;
}


export type PageConfig = PretrainPageConfig | MainPageConfig;

export interface SurveyConfig {
  survey_id: string;
  title: string;
  pages: PageConfig[];
}

// 问卷配置
export const surveyConfig: SurveyConfig = {
  survey_id: 'singing_motion_synthesis_v2',
  title: '用户研究：音频驱动唱歌数字人肢体动作合成模型的效果评估',
  
  pages: [
    // 第一页：预训练模型评估
    {
      type: 'pretrain',
      groups: [
        {
          part: '头部',
          reference_video: '/video/vqvae/synsinger/Evander-就是爱你-1.mp4',
          videoA: '/video/vqvae/synsinger/Evander-就是爱你-1_VQ_F.mp4',
          videoB: '/video/vqvae/emage/Evander-就是爱你-1_VQ_F.mp4'
        },
        {
          part: '手部',
          reference_video: '/video/vqvae/synsinger/Evander-就是爱你-1.mp4',
          videoA: 'https://example.com/videos/pretrain_hand_a.mp4',
          videoB: 'https://example.com/videos/pretrain_hand_b.mp4'
        },
        {
          part: '上肢',
          reference_video: '/video/vqvae/synsinger/Evander-就是爱你-1.mp4',
          videoA: 'https://example.com/videos/pretrain_upper_a.mp4',
          videoB: 'https://example.com/videos/pretrain_upper_b.mp4'
        },
        {
          part: '下肢',
          reference_video: '/video/vqvae/synsinger/Evander-就是爱你-1.mp4',
          videoA: 'https://example.com/videos/pretrain_lower_a.mp4',
          videoB: 'https://example.com/videos/pretrain_lower_b.mp4'
        }
      ]
    },
    
    // 第二页：动作的自然度
    {
      type: 'main',
      page: 2,
      dimension: '动作的自然度',
      dimensionDescription: '人物动作是否连贯自然、是否符合人体运动规律？',
      videos: [
        { id: 'A', video_url: 'https://example.com/videos/p2_a.mp4', label: '视频A' },
        { id: 'B', video_url: 'https://example.com/videos/p2_b.mp4', label: '视频B' },
        { id: 'C', video_url: 'https://example.com/videos/p2_c.mp4', label: '视频C' },
        { id: 'D', video_url: 'https://example.com/videos/p2_d.mp4', label: '视频D' },
        { id: 'E', video_url: 'https://example.com/videos/p2_e.mp4', label: '视频E' },
        { id: 'F', video_url: 'https://example.com/videos/p2_f.mp4', label: '视频F' },
        { id: 'G', video_url: 'https://example.com/videos/p2_g.mp4', label: '视频G' }
      ]
    },
    
    // 第三页：动作与歌声能量的对应
    {
      type: 'main',
      page: 3,
      dimension: '动作与歌声能量的对应',
      dimensionDescription: '动作是否会对歌声的强弱、高低音做出相应的反应。',
      videos: [
        { id: 'A', video_url: 'https://example.com/videos/p3_a.mp4', label: '视频A' },
        { id: 'B', video_url: 'https://example.com/videos/p3_b.mp4', label: '视频B' },
        { id: 'C', video_url: 'https://example.com/videos/p3_c.mp4', label: '视频C' },
        { id: 'D', video_url: 'https://example.com/videos/p3_d.mp4', label: '视频D' },
        { id: 'E', video_url: 'https://example.com/videos/p3_e.mp4', label: '视频E' },
        { id: 'F', video_url: 'https://example.com/videos/p3_f.mp4', label: '视频F' },
        { id: 'G', video_url: 'https://example.com/videos/p3_g.mp4', label: '视频G' }
      ]
    },
    
    // 第四页：动作与歌声节奏的对应
    {
      type: 'main',
      page: 4,
      dimension: '动作与歌声节奏的对应',
      dimensionDescription: '动作是否会对歌声中换气、律动、长音延续做出相应的反应。',
      videos: [
        { id: 'A', video_url: 'https://example.com/videos/p4_a.mp4', label: '视频A' },
        { id: 'B', video_url: 'https://example.com/videos/p4_b.mp4', label: '视频B' },
        { id: 'C', video_url: 'https://example.com/videos/p4_c.mp4', label: '视频C' },
        { id: 'D', video_url: 'https://example.com/videos/p4_d.mp4', label: '视频D' },
        { id: 'E', video_url: 'https://example.com/videos/p4_e.mp4', label: '视频E' },
        { id: 'F', video_url: 'https://example.com/videos/p4_f.mp4', label: '视频F' },
        { id: 'G', video_url: 'https://example.com/videos/p4_g.mp4', label: '视频G' }
      ]
    },
    
    // 第五页：动作与关键语义的对应
    {
      type: 'main',
      page: 5,
      dimension: '动作与关键语义的对应',
      dimensionDescription: '动作是否会对歌声中关键的语义做出反映，例如"放开"',
      videos: [
        { id: 'A', video_url: 'https://example.com/videos/p5_a.mp4', label: '视频A' },
        { id: 'B', video_url: 'https://example.com/videos/p5_b.mp4', label: '视频B' },
        { id: 'C', video_url: 'https://example.com/videos/p5_c.mp4', label: '视频C' },
        { id: 'D', video_url: 'https://example.com/videos/p5_d.mp4', label: '视频D' },
        { id: 'E', video_url: 'https://example.com/videos/p5_e.mp4', label: '视频E' },
        { id: 'F', video_url: 'https://example.com/videos/p5_f.mp4', label: '视频F' },
        { id: 'G', video_url: 'https://example.com/videos/p5_g.mp4', label: '视频G' }
      ],
      lyrics: '踏遍万里江山',
      highlightWord: '万里'
    },
    
    // 第六页：特殊音素的口型一致性
    {
      type: 'main',
      page: 6,
      dimension: '特殊音素的口型一致性',
      dimensionDescription: '口型是否能与歌声同步且能做出相应的开合。',
      videos: [
        { id: 'A', video_url: 'https://example.com/videos/p6_a.mp4', label: '视频A' },
        { id: 'B', video_url: 'https://example.com/videos/p6_b.mp4', label: '视频B' },
        { id: 'C', video_url: 'https://example.com/videos/p6_c.mp4', label: '视频C' },
        { id: 'D', video_url: 'https://example.com/videos/p6_d.mp4', label: '视频D' },
        { id: 'E', video_url: 'https://example.com/videos/p6_e.mp4', label: '视频E' },
        { id: 'F', video_url: 'https://example.com/videos/p6_f.mp4', label: '视频F' },
        { id: 'G', video_url: 'https://example.com/videos/p6_g.mp4', label: '视频G' }
      ],
      lyrics: '放开万里长空',
      highlightWord: '万里'
    }
  ]
};