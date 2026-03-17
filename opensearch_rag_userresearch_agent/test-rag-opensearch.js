import { ragRetrieverTool } from './src/mastra/tools/rag-retriever-tool.js';
import { ragContextBuilderTool } from './src/mastra/tools/rag-context-builder.js';
import { ragSummarizeTool } from './src/mastra/tools/rag-summarize-tool.js';

async function testRAGWithOpenSearch() {
  console.log('🧪 Testing RAG Tools with OpenSearch Connection...\n');

  try {
    // Test 1: RAG Retriever
    console.log('1️⃣ Testing RAG Retriever...');
    const retrieverResult = await ragRetrieverTool.execute({
      context: {
        indices: ['insights-clzlir21k0003ah06fc3j9aty'],
        query: 'system performance',
        maxResults: 5,
        chunkSize: 1000,
        chunkOverlap: 200,
        relevanceThreshold: 0.3,
        includeMetadata: true
      }
    });
    
    console.log('✅ RAG Retriever Result:');
    console.log(`   - Retrieved: ${retrieverResult.totalRetrieved} documents`);
    console.log(`   - Created: ${retrieverResult.totalChunks} chunks`);
    console.log(`   - Processing time: ${retrieverResult.processingTime}ms`);
    console.log(`   - Average score: ${retrieverResult.averageScore.toFixed(2)}`);
    
    if (retrieverResult.chunks.length > 0) {
      console.log(`   - First chunk preview: ${retrieverResult.chunks[0].content.substring(0, 100)}...`);
    }
    console.log('');

    // Test 2: RAG Context Builder
    console.log('2️⃣ Testing RAG Context Builder...');
    const contextResult = await ragContextBuilderTool.execute({
      context: {
        chunks: retrieverResult.chunks,
        query: 'system performance',
        maxContextLength: 8000,
        includeSources: true
      }
    });
    
    console.log('✅ RAG Context Builder Result:');
    console.log(`   - Context length: ${contextResult.contextLength} characters`);
    console.log(`   - Sources included: ${contextResult.sources.length}`);
    console.log(`   - Optimization score: ${contextResult.optimizationScore.toFixed(2)}`);
    console.log('');

    // Test 3: RAG Summarize
    console.log('3️⃣ Testing RAG Summarize...');
    const summarizeResult = await ragSummarizeTool.execute({
      context: {
        query: 'system performance',
        context: contextResult.context,
        sources: contextResult.sources,
        maxLength: 800
      }
    });
    
    console.log('✅ RAG Summarize Result:');
    console.log(`   - Summary length: ${summarizeResult.summary.length} characters`);
    console.log(`   - Confidence score: ${summarizeResult.confidence.toFixed(2)}`);
    console.log(`   - Key findings: ${summarizeResult.keyFindings?.length || 0}`);
    console.log(`   - Sources analyzed: ${summarizeResult.sources.length}`);
    console.log('');
    
    console.log('📝 Generated Summary:');
    console.log('─'.repeat(50));
    console.log(summarizeResult.summary);
    console.log('─'.repeat(50));
    console.log('');

    console.log('🎉 All RAG tools tested successfully!');
    
  } catch (error) {
    console.error('❌ Error testing RAG tools:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRAGWithOpenSearch();
