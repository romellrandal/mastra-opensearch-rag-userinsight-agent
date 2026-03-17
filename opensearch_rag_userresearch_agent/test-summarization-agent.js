import { opensearchAgent } from './.mastra/output/index.mjs';

async function testSummarizationAgent() {
  try {
    console.log('Testing Summarization Agent...\n');
    
    // Test 1: Basic summarization request
    console.log('=== Test 1: Basic Summarization ===');
    const response1 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Can you search for any documents and provide a summary of the results?'
        }
      ]
    });
    
    console.log('Agent Response:', response1);
    
    // Test 2: Specific summarization with insights
    console.log('\n=== Test 2: Detailed Summarization with Insights ===');
    const response2 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Search for documents and provide a detailed summary with key insights and findings.'
        }
      ]
    });
    
    console.log('Agent Response:', response2);
    
    // Test 3: Interactive summarization
    console.log('\n=== Test 3: Interactive Summarization ===');
    const response3 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'I want to understand the data better. Can you search for recent documents and summarize what you find?'
        }
      ]
    });
    
    console.log('Agent Response:', response3);
    
  } catch (error) {
    console.error('Error testing summarization agent:', error);
  }
}

// Run the test
testSummarizationAgent();
