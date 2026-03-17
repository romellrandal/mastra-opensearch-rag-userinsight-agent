import { mastra } from './.mastra/output/index.mjs';

async function testOpenSearchAgent() {
  try {
    console.log('Testing OpenSearch Agent via Mastra...');
    
    // Test 1: Get cluster information
    console.log('\n=== Test 1: Get cluster information ===');
    const response1 = await mastra.getAgent('opensearchAgent').run({
      messages: [
        {
          role: 'user',
          content: 'Can you tell me about the OpenSearch cluster?'
        }
      ]
    });
    
    console.log('Agent Response:', response1);
    
    // Test 2: Search for documents
    console.log('\n=== Test 2: Search for documents ===');
    const response2 = await mastra.getAgent('opensearchAgent').run({
      messages: [
        {
          role: 'user',
          content: 'Search for documents in the "logs" index containing "error"'
        }
      ]
    });
    
    console.log('Agent Response:', response2);
    
  } catch (error) {
    console.error('Error testing OpenSearch agent:', error);
  }
}

// Run the test
testOpenSearchAgent(); 