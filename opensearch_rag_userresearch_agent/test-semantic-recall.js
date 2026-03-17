import { opensearchAgent } from './.mastra/output/index.mjs';

async function testSemanticRecall() {
  try {
    console.log('🧠 Testing Semantic Recall with OpenSearch Agent...\n');

    // First conversation - about searching for errors
    console.log('=== Conversation 1: Error Search ===');
    const response1 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Search for documents containing "error" in the logs index'
        }
      ]
    });
    console.log('Response 1:', response1.content);
    console.log('\n');

    // Second conversation - about user activity
    console.log('=== Conversation 2: User Activity ===');
    const response2 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Find user activity in the analytics index'
        }
      ]
    });
    console.log('Response 2:', response2.content);
    console.log('\n');

    // Third conversation - about performance issues
    console.log('=== Conversation 3: Performance Issues ===');
    const response3 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'Look for performance problems in the system logs'
        }
      ]
    });
    console.log('Response 3:', response3.content);
    console.log('\n');

    // Fourth conversation - semantic recall test (should recall error-related context)
    console.log('=== Conversation 4: Semantic Recall Test ===');
    console.log('Asking about "problems" - should recall error-related conversations...');
    const response4 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'What problems did we find earlier?'
        }
      ]
    });
    console.log('Response 4 (with semantic recall):', response4.content);
    console.log('\n');

    // Fifth conversation - another semantic recall test
    console.log('=== Conversation 5: Another Semantic Recall Test ===');
    console.log('Asking about "logs" - should recall both error and performance conversations...');
    const response5 = await opensearchAgent.run({
      messages: [
        {
          role: 'user',
          content: 'What did we discover in the logs?'
        }
      ]
    });
    console.log('Response 5 (with semantic recall):', response5.content);
    console.log('\n');

    console.log('✅ Semantic Recall Test Completed!');
    console.log('\n📝 Note: Check the agent traces to see which messages were recalled via semantic similarity.');

  } catch (error) {
    console.error('❌ Error testing semantic recall:', error);
  }
}

// Run the test
testSemanticRecall();
