import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const videos = [
  { name: 'Electric Kettle', file: 'kettle (1).mp4' },
  { name: 'Kettle Tray', file: 'Kettle tray (1).mp4' },
  { name: 'Hotel Hangers', file: 'hanger (1).mp4' },
  { name: 'RFID Door Lock', file: 'Rfid.mp4' },
];

const prompt = `Analyze this LAXREE hotel product video in detail. Extract ALL information that would be useful for creating a comprehensive product training PDF for salespeople. Include:

1. PRODUCT OVERVIEW: Full product name, category, target hotel segments
2. KEY FEATURES: Every feature shown or mentioned in the video (be specific)
3. TECHNICAL SPECIFICATIONS: All specs, dimensions, materials, capacities mentioned
4. PRODUCT MODELS/VARIANTS: All different models, series, or variants shown
5. SELLING POINTS: Key arguments a salesperson should use
6. OBJECTION HANDLING: Common customer doubts and how to address them
7. USE CASES: Specific hotel scenarios where this product excels
8. PRICING POSITIONING: Budget/mid-range/premium indicators
9. COMPETITIVE ADVANTAGES: What makes LAXREE's version better
10. VIDEO TRANSCRIPT: Detailed step-by-step description of what's shown in the video

Be extremely thorough and specific. This will be used to train salespeople.`;

async function main() {
  const zai = await ZAI.create();
  const results = {};
  
  for (const video of videos) {
    const videoPath = path.join('/home/z/my-project/upload', video.file);
    console.log(`\n🎬 Analyzing: ${video.name} (${video.file})...`);
    
    try {
      // Read video and convert to base64
      const videoBuffer = fs.readFileSync(videoPath);
      const base64Video = videoBuffer.toString('base64');
      const videoUrl = `data:video/mp4;base64,${base64Video}`;
      
      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'video_url', video_url: { url: videoUrl } }
            ]
          }
        ],
        thinking: { type: 'enabled' }
      });
      
      const content = response.choices[0]?.message?.content;
      results[video.name] = content;
      console.log(`✅ Analysis complete for ${video.name}`);
      console.log(`Content length: ${content?.length || 0} chars`);
    } catch (error) {
      console.error(`❌ Error analyzing ${video.name}:`, error.message);
      results[video.name] = null;
    }
  }
  
  // Save results
  const outputPath = '/home/z/my-project/upload/video-analysis.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results saved to: ${outputPath}`);
}

main().catch(console.error);
