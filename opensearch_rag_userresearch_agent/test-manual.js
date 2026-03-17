import { mastra } from './.mastra/output/index.mjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testManual() {
  try {
    console.log('🧠 Manual Semantic Recall Test');
    console.log('===============================\n');
    
    // Get the OpenSearch agent
    const agent = mastra.getAgent('opensearchAgent');
    
    if (!agent) {
      console.error('❌ OpenSearch agent not found');
      return;
    }

    console.log('✅ OpenSearch Agent loaded successfully');
    console.log('📝 This agent has semantic recall enabled!');
    console.log('\n💡 Test semantic recall by:');
    console.log('   1. First ask about specific topics (errors, performance, etc.)');
    console.log('   2. Then ask about related topics using different words');
    console.log('   3. The agent should recall semantically similar conversations');
    console.log('\n📝 Example conversation flow:');
    console.log('   - "Search for errors in logs"');
    console.log('   - "Find performance issues"');
    console.log('   - "What problems did we find?" (should recall both)');
    console.log('\n🔧 Type "quit" to exit\n');

    while (true) {
      const prompt = await new Promise((resolve) => {
        rl.question('🤖 Enter your prompt: ', resolve);
      });

      if (prompt.toLowerCase() === 'quit') {
        break;
      }

      if (prompt.trim() === '') {
        continue;
      }

      console.log('\n🔄 Processing...\n');

      try {
        const response = await agent.run({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        console.log(`📝 Response: ${response.content}\n`);
        console.log('─'.repeat(60) + '\n');

      } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('─'.repeat(60) + '\n');
      }
    }

    console.log('👋 Test completed!');
    rl.close();

  } catch (error) {
    console.error('❌ Error in manual test:', error);
    rl.close();
  }
}

// Run the test
testManual();

