const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/survey.db');
const db = new Database(dbPath, { readonly: true });
/**

// 导出为 CSV 格式
function exportToCSV() {
  console.log('开始导出数据...\n');
  
  // 导出 responses
  console.log('导出提交记录...');
  const responses = db.prepare('SELECT * FROM responses ORDER BY created_at DESC').all();
  
  if (responses.length === 0) {
    console.log('没有数据可导出');
    return;
  }
  
  let responsesCSV = 'id,survey_id,respondent_id,created_at,user_agent,ip\n';
  responses.forEach(r => {
    responsesCSV += `${r.id},"${r.survey_id}","${r.respondent_id}","${r.created_at}","${r.user_agent || ''}","${r.ip || '"}"\n`;
        });
  
  const responsesFile = path.join(__dirname, '../data/responses.csv');
  fs.writeFileSync(responsesFile, responsesCSV);
  console.log(`✅ 提交记录已导出到: ${responsesFile}`);
  console.log(`   共 ${responses.length} 条记录\n`);
  
  // 导出预训练答案
  console.log('导出预训练模型评价...');
  const pretrainAnswers = db.prepare('SELECT * FROM pretrain_answers ORDER BY response_id, body_part').all();
  
  let pretrainCSV = 'id,response_id,body_part,naturalness,similarity\n';
  pretrainAnswers.forEach(a => {
    pretrainCSV += `${a.id},${a.response_id},"${a.body_part}","${a.naturalness}","${a.similarity}"\n`;
  });
  
  const pretrainFile = path.join(__dirname, '../data/pretrain_answers.csv');
  fs.writeFileSync(pretrainFile, pretrainCSV);
  console.log(`✅ 预训练评价已导出到: ${pretrainFile}`);
  console.log(`   共 ${pretrainAnswers.length} 条记录\n`);
  
  // 导出主模型答案
  console.log('导出主模型评价...');
  const mainAnswers = db.prepare('SELECT * FROM main_answers ORDER BY response_id, page, video_id').all();
  
  let mainCSV = 'id,response_id,page,video_id,score,is_best\n';
  mainAnswers.forEach(a => {
    mainCSV += `${a.id},${a.response_id},${a.page},"${a.video_id}",${a.score},${a.is_best}\n`;
  });
  
  const mainFile = path.join(__dirname, '../data/main_answers.csv');
  fs.writeFileSync(mainFile, mainCSV);
  console.log(`✅ 主模型评价已导出到: ${mainFile}`);
  console.log(`   共 ${mainAnswers.length} 条记录\n`);
  
  // 导出预训练统计
  console.log('生成预训练模型统计...');
  const pretrainStatsNaturalness = db.prepare(`
    SELECT 
      body_part,
      naturalness,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY body_part), 2) as percentage
    FROM pretrain_answers
    GROUP BY body_part, naturalness
    ORDER BY body_part, naturalness
  `).all();
  
  let pretrainStatsCSV = 'body_part,dimension,choice,count,percentage\n';
  pretrainStatsNaturalness.forEach(s => {
    pretrainStatsCSV += `"${s.body_part}","自然度","${s.naturalness}",${s.count},${s.percentage}\n`;
  });
  
  const pretrainStatsSimilarity = db.prepare(`
    SELECT 
      body_part,
      similarity,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY body_part), 2) as percentage
    FROM pretrain_answers
    GROUP BY body_part, similarity
    ORDER BY body_part, similarity
  `).all();
  
  pretrainStatsSimilarity.forEach(s => {
    pretrainStatsCSV += `"${s.body_part}","相似度","${s.similarity}",${s.count},${s.percentage}\n`;
  });
  
  const pretrainStatsFile = path.join(__dirname, '../data/pretrain_statistics.csv');
  fs.writeFileSync(pretrainStatsFile, pretrainStatsCSV);
  console.log(`✅ 预训练统计已导出到: ${pretrainStatsFile}\n`);
  
  // 导出主模型统计
  console.log('生成主模型统计...');
  const mainStats = db.prepare(`
    SELECT 
      page,
      video_id,
      COUNT(*) as count,
      ROUND(AVG(score), 2) as avg_score,
      MIN(score) as min_score,
      MAX(score) as max_score,
      SUM(is_best) as best_count,
      ROUND(SUM(is_best) * 100.0 / COUNT(*), 2) as best_percentage
    FROM main_answers
    GROUP BY page, video_id
    ORDER BY page, video_id
  `).all();
  
  let mainStatsCSV = 'page,video_id,count,avg_score,min_score,max_score,best_count,best_percentage\n';
  mainStats.forEach(s => {
    mainStatsCSV += `${s.page},"${s.video_id}",${s.count},${s.avg_score},${s.min_score},${s.max_score},${s.best_count},${s.best_percentage}\n`;
  });
  
  const mainStatsFile = path.join(__dirname, '../data/main_statistics.csv');
  fs.writeFileSync(mainStatsFile, mainStatsCSV);
  console.log(`✅ 主模型统计已导出到: ${mainStatsFile}\n`);
  
  // 打印概览
  console.log('========== 数据概览 ==========');
  console.log(`总提交数: ${responses.length}`);
  console.log(`预训练评价数: ${pretrainAnswers.length}`);
  console.log(`主模型评价数: ${mainAnswers.length}`);
  console.log('==============================\n');
  
  // 打印每页得分最高的视频
  console.log('每页平均分最高视频:');
  for (let page = 2; page <= 6; page++) {
    const topVideo = mainStats
      .filter(s => s.page === page)
      .sort((a, b) => b.avg_score - a.avg_score)[0];
    if (topVideo) {
      console.log(`  第${page}页: 视频${topVideo.video_id} (平均分: ${topVideo.avg_score}, 被选为最佳: ${topVideo.best_count}次)`);
    }
  }
}

try {
  exportToCSV();
  db.close();
  console.log('\n✅ 导出完成！');
} catch (error) {
  console.error('❌ 导出失败:', error);
  process.exit(1);
} 
  * 
 * @returns 
 */