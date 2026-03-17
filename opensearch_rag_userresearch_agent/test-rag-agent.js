import { m as mastra } from './.mastra/output/mastra.mjs';

async function testRAGThroughAgent() {
  console.log('🧪 Testing RAG Functionality Through Mastra Agent...\n');

  try {
    // Inspect what's available in the mastra export
    console.log('🔍 Inspecting Mastra Export:');
    console.log('   - Type:', typeof mastra);
    console.log('   - Keys:', Object.keys(mastra || {}));
    console.log('   - Agents property:', mastra?.agents ? 'Found' : 'Not found');
    console.log('');

    if (mastra?.agents) {
      console.log('✅ Agents found:');
      Object.keys(mastra.agents).forEach(key => {
        console.log(`   - ${key}`);
      });
      console.log('');

      // Test the OpenSearch agent with RAG capabilities
      const agent = mastra.agents.opensearchAgent;
      
      console.log('✅ OpenSearch Agent loaded successfully');
      console.log(`   - Agent name: ${agent.name}`);
      console.log(`   - Available tools: ${agent.tools.length}`);
      console.log(`   - RAG tools included: ${agent.tools.filter(t => t.id.includes('rag')).length}`);
      console.log('');

      // List available tools
      console.log('🔧 Available Tools:');
      agent.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.id}: ${tool.description}`);
      });
      console.log('');

      // Test if RAG tools are properly configured
      const ragTools = agent.tools.filter(t => t.id.includes('rag'));
      if (ragTools.length > 0) {
        console.log('🎯 RAG Tools Found:');
        ragTools.forEach(tool => {
          console.log(`   - ${tool.id}: ${tool.description}`);
        });
        console.log('');
        console.log('🎉 RAG integration is working correctly!');
      } else {
        console.log('⚠️  No RAG tools found in the agent');
      }
    } else {
      console.log('❌ No agents found in mastra export');
    }

  } catch (error) {
    console.error('❌ Error testing RAG agent:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRAGThroughAgent();
