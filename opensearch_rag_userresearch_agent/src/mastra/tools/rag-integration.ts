import { ragRetrieverTool } from './rag-retriever-tool';
import { ragContextBuilderTool } from './rag-context-builder';
import { ragSummarizeTool } from './rag-summarize-tool';

// Main RAG integration interface
export interface RAGSummarizeInput {
  indices: string[];
  query: string;
  maxResults?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  relevanceThreshold?: number;
  maxContextLength?: number;
  includeSources?: boolean;
  includeInsights?: boolean;
  confidenceThreshold?: number;
}

export interface RAGSummarizeOutput {
  summary: string;
  sources: Array<{
    index: string;
    id: string;
    score: number;
    relevance: string;
    contribution: string;
  }>;
  confidence: number;
  retrievedCount: number;
  contextLength: number;
  processingTime: number;
  insights?: string[];
  keyFindings?: string[];
  optimizationMetrics?: {
    relevanceScore: number;
    coverageScore: number;
    efficiencyScore: number;
  };
}

/**
 * Main RAG integration function that orchestrates the entire pipeline
 * @param input RAG summarization parameters
 * @returns Comprehensive summary with source attribution and metrics
 */
export async function summarize_with_rag(input: RAGSummarizeInput): Promise<RAGSummarizeOutput> {
  const startTime = Date.now();
  
  try {
    const {
      indices,
      query,
      maxResults = 20,
      chunkSize = 1000,
      chunkOverlap = 200,
      relevanceThreshold = 0.3,
      maxContextLength = 8000,
      includeSources = true,
      includeInsights = true,
      confidenceThreshold = 0.7,
    } = input;

    // Validate inputs
    if (!indices || indices.length === 0) {
      throw new Error('At least one index must be specified');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    console.log(`Starting RAG summarization for query: "${query}"`);
    console.log(`Searching indices: ${indices.join(', ')}`);

    // Step 1: Retrieve relevant documents using RAG retriever
    console.log('Step 1: Retrieving relevant documents...');
    const retrievalResult = await ragRetrieverTool.execute({
      context: {
        indices,
        query,
        maxResults,
        chunkSize,
        chunkOverlap,
        relevanceThreshold,
        includeMetadata: true,
      },
    });

    console.log(`Retrieved ${retrievalResult.totalRetrieved} documents, created ${retrievalResult.totalChunks} chunks`);

    if (retrievalResult.chunks.length === 0) {
      return {
        summary: 'No relevant documents found for the query.',
        sources: [],
        confidence: 0,
        retrievedCount: 0,
        contextLength: 0,
        processingTime: Date.now() - startTime,
      };
    }

    // Step 2: Build optimized context for LLM
    console.log('Step 2: Building optimized context...');
    const contextResult = await ragContextBuilderTool.execute({
      context: {
        chunks: retrievalResult.chunks,
        query,
        maxContextLength,
        prioritizeRelevance: true,
        includeMetadata: false,
        queryFocus: true,
      },
    });

    console.log(`Built context with ${contextResult.chunkCount} chunks, length: ${contextResult.contextLength}`);

    // Step 3: Generate RAG-powered summary
    console.log('Step 3: Generating summary with RAG context...');
    const summaryResult = await ragSummarizeTool.execute({
      context: {
        query,
        context: contextResult.context,
        sources: contextResult.sources,
        maxLength: 800,
        includeInsights,
        includeSources,
        confidenceThreshold,
      },
    });

    console.log(`Generated summary with confidence: ${summaryResult.confidence}`);

    const totalProcessingTime = Date.now() - startTime;

    // Step 4: Compile final output
    const output: RAGSummarizeOutput = {
      summary: summaryResult.summary,
      sources: summaryResult.sources,
      confidence: summaryResult.confidence,
      retrievedCount: retrievalResult.totalRetrieved,
      contextLength: contextResult.contextLength,
      processingTime: totalProcessingTime,
      insights: summaryResult.insights,
      keyFindings: summaryResult.keyFindings,
      optimizationMetrics: contextResult.optimizationMetrics,
    };

    console.log(`RAG summarization completed in ${totalProcessingTime}ms`);
    console.log(`Final confidence score: ${output.confidence}`);
    console.log(`Context utilization: ${output.optimizationMetrics?.efficiencyScore || 0}`);

    return output;

  } catch (error) {
    console.error('RAG integration error:', error);
    
    // Return fallback response
    return {
      summary: `Error during RAG summarization: ${error.message}. Please try again or use the standard summarization method.`,
      sources: [],
      confidence: 0,
      retrievedCount: 0,
      contextLength: 0,
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Simplified RAG summarization function with minimal parameters
 * @param indices List of OpenSearch indices to search
 * @param query User query for summarization
 * @returns RAG-powered summary
 */
export async function simpleRAGSummarize(
  indices: string[],
  query: string
): Promise<RAGSummarizeOutput> {
  return summarize_with_rag({
    indices,
    query,
    maxResults: 15,
    chunkSize: 1000,
    chunkOverlap: 200,
    relevanceThreshold: 0.3,
    maxContextLength: 6000,
    includeSources: true,
    includeInsights: true,
    confidenceThreshold: 0.7,
  });
}

/**
 * High-quality RAG summarization with optimized parameters for research
 * @param indices List of OpenSearch indices to search
 * @param query User query for summarization
 * @returns High-quality RAG-powered summary
 */
export async function researchRAGSummarize(
  indices: string[],
  query: string
): Promise<RAGSummarizeOutput> {
  return summarize_with_rag({
    indices,
    query,
    maxResults: 30,
    chunkSize: 800,
    chunkOverlap: 150,
    relevanceThreshold: 0.5,
    maxContextLength: 10000,
    includeSources: true,
    includeInsights: true,
    confidenceThreshold: 0.8,
  });
}

/**
 * Fast RAG summarization with minimal processing for quick results
 * @param indices List of OpenSearch indices to search
 * @param query User query for summarization
 * @returns Quick RAG-powered summary
 */
export async function fastRAGSummarize(
  indices: string[],
  query: string
): Promise<RAGSummarizeOutput> {
  return summarize_with_rag({
    indices,
    query,
    maxResults: 10,
    chunkSize: 1200,
    chunkOverlap: 100,
    relevanceThreshold: 0.2,
    maxContextLength: 4000,
    includeSources: false,
    includeInsights: false,
    confidenceThreshold: 0.6,
  });
}
