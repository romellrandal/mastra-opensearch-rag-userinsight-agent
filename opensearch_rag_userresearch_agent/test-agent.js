// Simple test for YouTube agent using compiled Mastra output
import { mastra } from './.mastra/output/index.mjs';

console.log('Testing YouTube Agent...');

// Access the YouTube agent from the mastra instance
const youtubeAgent = mastra.agents.youtubeAgent;

console.log('Agent name:', youtubeAgent.name);
console.log('Agent instructions:', youtubeAgent.instructions);
console.log('Agent tools:', youtubeAgent.tools);

// Test the agent with a simple message
try {
  const result = await youtubeAgent.run({
    messages: [
      {
        role: 'user',
        content: 'What is the subscriber count for @mrbeast?'
      }
    ]
  });
  
  console.log('Agent response:', result);
} catch (error) {
  console.error('Error testing agent:', error.message);
}