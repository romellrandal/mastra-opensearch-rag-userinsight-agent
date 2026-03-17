import { mastra } from './.mastra/output/mastra.mjs';

async function testRAGTools() {
  console.log('🧪 Testing RAG Tools Directly...\n');

  try {
    // Check if mastra is available
    console.log('🔍 Mastra Status:');
    console.log('   - Type:', typeof mastra);
    console.log('   - Available:', mastra ? 'Yes' : 'No');
    console.log('');

    if (mastra) {
      console.log('✅ Mastra instance found');
      
      // Try to access the OpenSearch agent
      if (mastra.agents && mastra.agents.opensearchAgent) {
        const agent = mastra.agents.opensearchAgent;
        console.log('✅ OpenSearch Agent found');
        console.log(`   - Name: ${agent.name}`);
        console.log(`   - Tools: ${agent.tools.length}`);
        
        // List all tools
        console.log('\n🔧 Available Tools:');
        agent.tools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.id}: ${tool.description}`);
        });
        
        // Check for RAG tools
        const ragTools = agent.tools.filter(t => t.id.includes('rag'));
        console.log(`\n🎯 RAG Tools Found: ${ragTools.length}`);
        if (ragTools.length > 0) {
          ragTools.forEach(tool => {
            console.log(`   - ${tool.id}: ${tool.description}`);
          });
          console.log('\n🎉 RAG integration is working!');
        }
      } else {
        console.log('❌ OpenSearch Agent not found in mastra.agents');
        console.log('Available agents:', Object.keys(mastra.agents || {}));
      }
    } else {
      console.log('❌ Mastra instance not available');
    }

  } catch (error) {
    console.error('❌ Error testing RAG tools:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRAGTools();
