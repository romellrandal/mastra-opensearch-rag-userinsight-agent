#!/usr/bin/env node

/**
 * Example Usage of RAG Integration Functions
 * 
 * This file demonstrates how to use the RAG integration functions
 * for OpenSearch-based research summarization.
 */

// Import the RAG integration functions
import { 
  summarize_with_rag, 
  simpleRAGSummarize, 
  researchRAGSummarize, 
  fastRAGSummarize 
} from './src/mastra/tools/rag-integration.js';

async function demonstrateRAGUsage() {
  console.log("🚀 RAG Integration Usage Examples");
  console.log("=".repeat(50));
  
  // Example 1: Simple RAG summarization
  console.log("\n1. Simple RAG Summarization");
  console.log("-".repeat(30));
  
  try {
    const simpleResult = await simpleRAGSummarize(
      ["logs", "analytics"], 
      "system errors and user activity"
    );
    
    console.log(`Summary: ${simpleResult.summary.substring(0, 100)}...`);
    console.log(`Confidence: ${simpleResult.confidence}`);
    console.log(`Sources: ${simpleResult.sources.length}`);
    console.log(`Processing Time: ${simpleResult.processingTime}ms`);
  } catch (error) {
    console.error(`Error in simple RAG: ${error.message}`);
  }
  
  // Example 2: Research-quality RAG summarization
  console.log("\n2. Research-Quality RAG Summarization");
  console.log("-".repeat(30));
  
  try {
    const researchResult = await researchRAGSummarize(
      ["logs", "analytics", "performance"], 
      "comprehensive system performance analysis"
    );
    
    console.log(`Summary: ${researchResult.summary.substring(0, 100)}...`);
    console.log(`Confidence: ${researchResult.confidence}`);
    console.log(`Sources: ${researchResult.sources.length}`);
    console.log(`Context Length: ${researchResult.contextLength} characters`);
    console.log(`Processing Time: ${researchResult.processingTime}ms`);
    
    if (researchResult.insights) {
      console.log(`Key Insights: ${researchResult.insights.length}`);
    }
  } catch (error) {
    console.error(`Error in research RAG: ${error.message}`);
  }
  
  // Example 3: Fast RAG summarization
  console.log("\n3. Fast RAG Summarization");
  console.log("-".repeat(30));
  
  try {
    const fastResult = await fastRAGSummarize(
      ["logs"], 
      "recent error messages"
    );
    
    console.log(`Summary: ${fastResult.summary.substring(0, 100)}...`);
    console.log(`Confidence: ${fastResult.confidence}`);
    console.log(`Sources: ${fastResult.sources.length}`);
    console.log(`Processing Time: ${fastResult.processingTime}ms`);
  } catch (error) {
    console.error(`Error in fast RAG: ${error.message}`);
  }
  
  // Example 4: Custom RAG parameters
  console.log("\n4. Custom RAG Parameters");
  console.log("-".repeat(30));
  
  try {
    const customResult = await summarize_with_rag({
      indices: ["logs", "analytics"],
      query: "user authentication patterns",
      maxResults: 25,
      chunkSize: 800,
      chunkOverlap: 150,
      relevanceThreshold: 0.4,
      maxContextLength: 12000,
      includeSources: true,
      includeInsights: true,
      confidenceThreshold: 0.8
    });
    
    console.log(`Summary: ${customResult.summary.substring(0, 100)}...`);
    console.log(`Confidence: ${customResult.confidence}`);
    console.log(`Sources: ${customResult.sources.length}`);
    console.log(`Context Length: ${customResult.contextLength} characters`);
    console.log(`Processing Time: ${customResult.processingTime}ms`);
    
    if (customResult.optimizationMetrics) {
      const metrics = customResult.optimizationMetrics;
      console.log(`Optimization Metrics:`);
      console.log(`  - Relevance: ${metrics.relevanceScore}`);
      console.log(`  - Coverage: ${metrics.coverageScore}`);
      console.log(`  - Efficiency: ${metrics.efficiencyScore}`);
    }
  } catch (error) {
    console.error(`Error in custom RAG: ${error.message}`);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ RAG Integration Examples Completed!");
}

// Run the examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRAGUsage().catch(console.error);
}

export { demonstrateRAGUsage };
