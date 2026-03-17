import { mastra } from './.mastra/output/index.mjs';

async function testInteractive() {
  try {
    console.log('🧠 Interactive Semantic Recall Test');
    console.log('=====================================\n');
    
    // Get the OpenSearch agent
    const agent = mastra.getAgent('opensearchAgent');
    
    if (!agent) {
      console.error('❌ OpenSearch agent not found');
      return;
    }

    console.log('✅ OpenSearch Agent loaded successfully');
    console.log('📝 This agent has semantic recall enabled with:');
    console.log('   - topK: 5 (retrieve 5 most similar messages)');
    console.log('   - messageRange: 2 (include surrounding context)');
    console.log('   - scope: resource (search across all threads)');
    console.log('   - embedder: OpenAI text-embedding-3-small\n');

    // Test conversation flow
    const conversations = [
      {
        title: "🔍 Initial Search - Error Logs",
        prompt: "Search for documents containing 'error' in the logs index"
      },
      {
        title: "📊 Second Search - User Activity", 
        prompt: "Find user activity in the analytics index"
      },
      {
        title: "⚡ Third Search - Performance Issues",
        prompt: "Look for performance problems in the system logs"
      },
      {
        title: "🧠 Semantic Recall Test 1 - Problems",
        prompt: "What problems did we find earlier?",
        expected: "Should recall error and performance-related searches"
      },
      {
        title: "🧠 Semantic Recall Test 2 - Logs",
        prompt: "What did we discover in the logs?",
        expected: "Should recall both error and performance conversations"
      },
      {
        title: "🧠 Semantic Recall Test 3 - Issues",
        prompt: "Tell me about the issues we found",
        expected: "Should recall error and performance searches"
      }
    ];

    for (let i = 0; i < conversations.length; i++) {
      const conv = conversations[i];
      console.log(`\n${conv.title}`);
      console.log(`Prompt: "${conv.prompt}"`);
      if (conv.expected) {
        console.log(`Expected: ${conv.expected}`);
      }
      console.log('-'.repeat(50));

      const response = await agent.run({
        messages: [
          {
            role: 'user',
            content: conv.prompt
          }
        ]
      });

      console.log(`Response: ${response.content}`);
      console.log('\n');
    }

    console.log('✅ Interactive test completed!');
    console.log('\n💡 Tips for testing semantic recall:');
    console.log('   - Try asking about "problems" after searching for "errors"');
    console.log('   - Ask about "logs" after multiple log-related searches');
    console.log('   - Use different words with similar meaning');
    console.log('   - Check agent traces to see recalled messages');

  } catch (error) {
    console.error('❌ Error in interactive test:', error);
  }
}

// Run the test
testInteractive();

