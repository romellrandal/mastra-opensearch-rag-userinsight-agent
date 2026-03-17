import { opensearchAgent } from './.mastra/output/index.mjs';

async function testOpenSearchAgent() {
  try {
    console.log('Testing OpenSearch Agent...');
    
    // Test 1: Get cluster information
    console.log('\n=== Test 1: Get cluster information ===');
    const response1 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Can you tell me about the OpenSearch cluster?'
        }
      ]
    });
    
    console.log('Agent Response:', response1);
    
  } catch (error) {
    console.error('Error testing OpenSearch agent:', error);
  }
}

// Run the test
testOpenSearchAgent(); 