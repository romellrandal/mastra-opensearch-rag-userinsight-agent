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
    
    // Test 2: Search for documents
    console.log('\n=== Test 2: Search for documents ===');
    const response2 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Search for documents in the "logs" index containing "error"'
        }
      ]
    });
    
    console.log('Agent Response:', response2);
    
    // Test 3: Summarize results
    console.log('\n=== Test 3: Summarize search results ===');
    const response3 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Can you search for "user activity" in the "analytics" index and summarize the results?'
        }
      ]
    });
    
    console.log('Agent Response:', response3);
    
  } catch (error) {
    console.error('Error testing OpenSearch agent:', error);
  }
}

// Run the test
testOpenSearchAgent(); 