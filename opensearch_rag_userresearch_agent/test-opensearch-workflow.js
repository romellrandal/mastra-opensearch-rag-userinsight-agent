import { mastra } from './.mastra/output/index.mjs';

async function testOpenSearchWorkflow() {
  try {
    console.log('Testing OpenSearch Workflow...');
    
    // Test the workflow with a sample query
    const result = await mastra.runWorkflow('opensearchWorkflow', {
      index: 'logs',
      query: 'error',
      size: 5
    });
    
    console.log('Workflow Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error testing OpenSearch workflow:', error);
  }
}

// Run the test
testOpenSearchWorkflow(); 