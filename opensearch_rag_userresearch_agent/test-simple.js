import { opensearchAgent } from './src/mastra/agents/opensearch-agent.ts';

async function testSimple() {
  try {
    console.log('🧠 Simple Semantic Recall Test');
    console.log('===============================\n');
    
    console.log('✅ OpenSearch Agent loaded');
    console.log('📝 Testing semantic recall...\n');

    // First conversation
    console.log('🔍 Conversation 1: Error Search');
    const response1 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Search for documents containing "error" in the logs index'
        }
      ]
    });
    console.log('Response:', response1.content);
    console.log('\n');

    // Second conversation
    console.log('📊 Conversation 2: Performance Issues');
    const response2 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Look for performance problems in the system logs'
        }
      ]
    });
    console.log('Response:', response2.content);
    console.log('\n');

    // Third conversation - semantic recall test
    console.log('🧠 Conversation 3: Semantic Recall Test');
    console.log('Asking about "problems" - should recall both error and performance searches');
    const response3 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'What problems did we find earlier?'
        }
      ]
    });
    console.log('Response:', response3.content);
    console.log('\n');

    console.log('✅ Test completed!');
    console.log('💡 Check if the agent recalled previous conversations about errors and performance issues.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testSimple();

