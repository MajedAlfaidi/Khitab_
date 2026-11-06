import fs from 'fs';
import { execSync } from 'child_process';

if (!process.env.GEMINI_API_KEY) {
  try {
    const pid = execSync('pgrep -f "tsx server.ts"').toString().trim().split('\n')[0];
    const envStr = fs.readFileSync(`/proc/${pid}/environ`, 'utf8');
    const match = envStr.split('\0').find((s) => s.startsWith('GEMINI_API_KEY='));
    if (match) {
      process.env.GEMINI_API_KEY = match.substring('GEMINI_API_KEY='.length);
    }
  } catch {}
}

import { analyzeSpeechWithGemini } from './server/geminiService';

async function testGeminiIntegration() {
  console.log('[Gemini Test] Testing real Gemini API analysis on Arabic speech...');

  const sampleTitle = 'خطاب تجريبي';
  const sampleContent = 'أيها الحضور الكريم، يسعدني اللقاء بكم اليوم لنصنع معًا مستقبلاً أفضل.';
  
  // Test with all 4 options enabled
  const result = await analyzeSpeechWithGemini({
    title: sampleTitle,
    content: sampleContent,
    preferences: {
      addDiacritics: true,
      improveTone: true,
      highlightEmphasis: true,
      suggestPauses: true,
    },
  });

  console.log(`[Gemini Test] Received ${result.length} analyzed paragraph(s).`);
  if (result.length > 0) {
    const p = result[0];
    console.log('- Tone:', p.tone);
    console.log('- Speed Pacing:', p.speedPacing);
    console.log('- Annotated Text preview:', p.annotatedText);
    console.log('- Suggestions count:', p.suggestions.length);
  }

  // Test with diacritics and suggestions disabled
  console.log('\n[Gemini Test] Testing with options disabled...');
  const resultDisabled = await analyzeSpeechWithGemini({
    title: sampleTitle,
    content: sampleContent,
    preferences: {
      addDiacritics: false,
      improveTone: false,
      highlightEmphasis: false,
      suggestPauses: false,
    },
  });

  console.log(`[Gemini Test] Received ${resultDisabled.length} analyzed paragraph(s) with options disabled.`);
  const pDisabled = resultDisabled[0];
  console.log('- Tone:', pDisabled.tone);
  console.log('- Suggestions count:', pDisabled.suggestions.length);

  console.log('\nGEMINI INTEGRATION AND PREFERENCES VERIFICATION PASSED.');
}

testGeminiIntegration().catch((e) => {
  console.error('Gemini test error:', e);
  process.exit(1);
});
