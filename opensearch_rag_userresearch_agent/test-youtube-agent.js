import { youtubeAgent } from './.mastra/output/index.mjs';

async function testYouTubeAgent() {
  try {
    console.log('Testing YouTube Agent...');
    
    // Test with a known YouTube channel
    const response = await youtubeAgent.run({
      messages: [
        {
          role: 'user',
          content: 'What is the subscriber count for @mrbeast?'
        }
      ]
    });
    
    console.log('Agent Response:', response);
    
  } catch (error) {
    console.error('Error testing YouTube agent:', error);
  }
}

testYouTubeAgent();