import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Document chunk interface (matching the retriever output)
interface DocumentChunk {
  content: string;
  source: {
    index: string;
    id: string;
    score: number;
    field?: string;
  };
  metadata?: Record<string, any>;
}

// Context optimization interface
interface ContextOptimization {
  maxLength: number;
  prioritizeRelevance: boolean;
  includeMetadata: boolean;
  queryFocus: boolean;
}

export const ragContextBuilderTool = createTool({
  id: 'rag-context-builder',
  description: 'Prepare retrieved documents for optimal LLM input with smart context optimization',
  inputSchema: z.object({
    chunks: z.array(z.object({
      content: z.string(),
      source: z.object({
        index: z.string(),
        id: z.string(),
        score: z.number(),
        field: z.string().optional(),
      }),
      metadata: z.record(z.any()).optional(),
    })).describe('Document chunks from RAG retriever'),
    query: z.string().describe('Original user query for context focus'),
    maxContextLength: z.number().optional().describe('Maximum context length for LLM (default: 8000)'),
    prioritizeRelevance: z.boolean().optional().describe('Prioritize chunks by relevance score (default: true)'),
    includeMetadata: z.boolean().optional().describe('Include metadata in context (default: false)'),
    queryFocus: z.boolean().optional().describe('Focus context on query-relevant content (default: true)'),
  }),
  outputSchema: z.object({
    context: z.string().describe('Optimized context for LLM input'),
    sources: z.array(z.object({
      index: z.string(),
      id: z.string(),
      score: z.number(),
      field: z.string().optional(),
      contentPreview: z.string(),
    })).describe('Source references for the context'),
    contextLength: z.number().describe('Actual context length in characters'),
    chunkCount: z.number().describe('Number of chunks included in context'),
    optimizationMetrics: z.object({
      relevanceScore: z.number(),
      coverageScore: z.number(),
      efficiencyScore: z.number(),
    }).describe('Context optimization metrics'),
  }),
  execute: async ({ context }) => {
    try {
      const {
        chunks,
        query,
        maxContextLength = 8000,
        prioritizeRelevance = true,
        includeMetadata = false,
        queryFocus = true,
      } = context;

      if (!chunks || chunks.length === 0) {
        return {
          context: 'No relevant documents found for the query.',
          sources: [],
          contextLength: 0,
          chunkCount: 0,
          optimizationMetrics: {
            relevanceScore: 0,
            coverageScore: 0,
            efficiencyScore: 0,
          },
        };
      }

      // Step 1: Preprocess and score chunks
      const processedChunks = preprocessChunks(chunks, query, queryFocus);

      // Step 2: Select optimal chunks based on constraints
      const selectedChunks = selectOptimalChunks(
        processedChunks,
        maxContextLength,
        prioritizeRelevance
      );

      // Step 3: Build context string
      const context = buildContextString(selectedChunks, includeMetadata);

      // Step 4: Calculate optimization metrics
      const metrics = calculateOptimizationMetrics(selectedChunks, chunks, maxContextLength);

      // Step 5: Prepare source references
      const sources = selectedChunks.map(chunk => ({
        index: chunk.source.index,
        id: chunk.source.id,
        score: chunk.source.score,
        field: chunk.source.field,
        contentPreview: chunk.content.substring(0, 100) + '...',
      }));

      return {
        context,
        sources,
        contextLength: context.length,
        chunkCount: selectedChunks.length,
        optimizationMetrics: metrics,
      };
    } catch (error) {
      console.error('RAG context builder error:', error);
      throw new Error(`RAG context building failed: ${error.message}`);
    }
  },
});

// Helper function to preprocess chunks
function preprocessChunks(
  chunks: DocumentChunk[],
  query: string,
  queryFocus: boolean
): Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }> {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  return chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    
    // Calculate relevance score (normalized)
    const relevanceScore = chunk.source.score / 10; // Assuming max score is around 10
    
    // Calculate query alignment if query focus is enabled
    let queryAlignment = 1.0;
    if (queryFocus && queryTerms.length > 0) {
      const termMatches = queryTerms.filter(term => content.includes(term)).length;
      queryAlignment = termMatches / queryTerms.length;
    }
    
    return {
      ...chunk,
      relevanceScore: Math.min(1.0, relevanceScore),
      queryAlignment,
    };
  });
}

// Helper function to select optimal chunks
function selectOptimalChunks(
  processedChunks: Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }>,
  maxContextLength: number,
  prioritizeRelevance: boolean
): Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }> {
  // Sort chunks by priority
  if (prioritizeRelevance) {
    processedChunks.sort((a, b) => {
      // Primary sort by relevance score
      const relevanceDiff = b.relevanceScore - a.relevanceScore;
      if (Math.abs(relevanceDiff) > 0.1) {
        return relevanceDiff;
      }
      // Secondary sort by query alignment
      return b.queryAlignment - a.queryAlignment;
    });
  } else {
    // Sort by query alignment first, then by relevance
    processedChunks.sort((a, b) => {
      const alignmentDiff = b.queryAlignment - a.queryAlignment;
      if (Math.abs(alignmentDiff) > 0.1) {
        return alignmentDiff;
      }
      return b.relevanceScore - a.relevanceScore;
    });
  }

  // Select chunks within context length limit
  const selectedChunks: Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }> = [];
  let currentLength = 0;
  
  for (const chunk of processedChunks) {
    const chunkLength = chunk.content.length + 100; // Add buffer for formatting
    
    if (currentLength + chunkLength <= maxContextLength) {
      selectedChunks.push(chunk);
      currentLength += chunkLength;
    } else {
      // Try to fit partial chunk if it's highly relevant
      if (chunk.relevanceScore > 0.8 && chunk.queryAlignment > 0.8) {
        const remainingLength = maxContextLength - currentLength;
        if (remainingLength > 200) { // Minimum chunk size
          const truncatedChunk = {
            ...chunk,
            content: chunk.content.substring(0, remainingLength - 100) + '...',
          };
          selectedChunks.push(truncatedChunk);
          currentLength = maxContextLength;
        }
      }
      break;
    }
  }

  return selectedChunks;
}

// Helper function to build context string
function buildContextString(
  selectedChunks: Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }>,
  includeMetadata: boolean
): string {
  if (selectedChunks.length === 0) {
    return 'No relevant documents found.';
  }

  const contextParts: string[] = [];
  
  contextParts.push('=== RELEVANT DOCUMENT CHUNKS ===\n');
  
  for (let i = 0; i < selectedChunks.length; i++) {
    const chunk = selectedChunks[i];
    
    contextParts.push(`[Chunk ${i + 1}]`);
    contextParts.push(`Source: ${chunk.source.index}/${chunk.source.id}`);
    contextParts.push(`Relevance Score: ${chunk.relevanceScore.toFixed(2)}`);
    contextParts.push(`Content:`);
    contextParts.push(chunk.content);
    
    if (includeMetadata && chunk.metadata) {
      const metadataStr = Object.entries(chunk.metadata)
        .filter(([key, value]) => 
          !['id', '_id', 'timestamp', 'created_at', 'updated_at'].includes(key) &&
          value !== null && value !== undefined
        )
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      if (metadataStr) {
        contextParts.push(`Metadata: ${metadataStr}`);
      }
    }
    
    contextParts.push(''); // Empty line between chunks
  }
  
  contextParts.push('=== END OF CONTEXT ===');
  
  return contextParts.join('\n');
}

// Helper function to calculate optimization metrics
function calculateOptimizationMetrics(
  selectedChunks: Array<DocumentChunk & { relevanceScore: number; queryAlignment: number }>,
  allChunks: DocumentChunk[],
  maxContextLength: number
): { relevanceScore: number; coverageScore: number; efficiencyScore: number } {
  if (selectedChunks.length === 0) {
    return {
      relevanceScore: 0,
      coverageScore: 0,
      efficiencyScore: 0,
    };
  }

  // Relevance score: average relevance of selected chunks
  const relevanceScore = selectedChunks.reduce((sum, chunk) => sum + chunk.relevanceScore, 0) / selectedChunks.length;

  // Coverage score: percentage of available chunks used
  const coverageScore = Math.min(1.0, selectedChunks.length / allChunks.length);

  // Efficiency score: how well we use the available context length
  const totalContentLength = selectedChunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
  const efficiencyScore = Math.min(1.0, totalContentLength / maxContextLength);

  return {
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    coverageScore: Math.round(coverageScore * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
  };
}
