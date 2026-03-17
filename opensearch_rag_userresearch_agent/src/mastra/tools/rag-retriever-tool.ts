import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getMCPClient } from './mcp-client';

// Document chunk interface
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

// Relevance scoring interface
interface RelevanceScore {
  tfidf: number;
  semantic: number;
  combined: number;
}

export const ragRetrieverTool = createTool({
  id: 'rag-retriever',
  description: 'Enhanced document retrieval with RAG capabilities including chunking, relevance scoring, and multi-index search',
  inputSchema: z.object({
    indices: z.array(z.string()).describe('List of OpenSearch indices to search'),
    query: z.string().describe('The search query for document retrieval'),
    maxResults: z.number().optional().describe('Maximum documents to retrieve (default: 20)'),
    chunkSize: z.number().optional().describe('Document chunk size in characters (default: 1000)'),
    chunkOverlap: z.number().optional().describe('Overlap between chunks in characters (default: 200)'),
    relevanceThreshold: z.number().optional().describe('Minimum relevance score (0-1, default: 0.3)'),
    includeMetadata: z.boolean().optional().describe('Include document metadata (default: true)'),
  }),
  outputSchema: z.object({
    chunks: z.array(z.object({
      content: z.string(),
      source: z.object({
        index: z.string(),
        id: z.string(),
        score: z.number(),
        field: z.string().optional(),
      }),
      metadata: z.record(z.any()).optional(),
    })),
    totalRetrieved: z.number(),
    totalChunks: z.number(),
    averageScore: z.number(),
    processingTime: z.number(),
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();
    
    try {
      const {
        indices,
        query,
        maxResults = 20,
        chunkSize = 1000,
        chunkOverlap = 200,
        relevanceThreshold = 0.3,
        includeMetadata = true,
      } = context;

      // Validate inputs
      if (indices.length === 0) {
        throw new Error('At least one index must be specified');
      }

      if (chunkSize <= 0) {
        throw new Error('Chunk size must be positive');
      }

      if (chunkOverlap >= chunkSize) {
        throw new Error('Chunk overlap must be less than chunk size');
      }

      // Perform multi-index search
      const searchQuery = {
        query: {
          multi_match: {
            query: query,
            fields: ['*'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        },
        size: maxResults * 2, // Retrieve more to account for chunking
      };

      // Search across all specified indices using MCP client
      const mcpClient = await getMCPClient();
      const response = await mcpClient.search(
        indices.join(','),
        searchQuery,
        maxResults * 2
      );

      const hits = response.hits?.hits || [];
      const totalRetrieved = hits.length;

      if (totalRetrieved === 0) {
        return {
          chunks: [],
          totalRetrieved: 0,
          totalChunks: 0,
          averageScore: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Process and chunk documents
      const chunks: DocumentChunk[] = [];
      let totalScore = 0;

      for (const hit of hits) {
        const score = hit._score || 0;
        totalScore += score;

        // Extract document content
        const source = hit._source || {};
        const content = extractTextContent(source);
        
        if (!content || content.trim().length === 0) {
          continue;
        }

        // Create chunks from document content
        const documentChunks = createChunks(
          content,
          chunkSize,
          chunkOverlap,
          {
            index: hit._index,
            id: hit._id,
            score: score,
          },
          includeMetadata ? source : undefined
        );

        chunks.push(...documentChunks);
      }

      // Filter chunks by relevance threshold
      const filteredChunks = chunks.filter(chunk => chunk.source.score >= relevanceThreshold);

      // Sort chunks by relevance score (descending)
      filteredChunks.sort((a, b) => b.source.score - a.source.score);

      // Limit total chunks to prevent context overflow
      const finalChunks = filteredChunks.slice(0, maxResults * 3);

      const processingTime = Date.now() - startTime;
      const averageScore = totalRetrieved > 0 ? totalScore / totalRetrieved : 0;

      return {
        chunks: finalChunks,
        totalRetrieved,
        totalChunks: finalChunks.length,
        averageScore,
        processingTime,
      };
    } catch (error) {
      console.error('RAG retriever error:', error);
      throw new Error(`RAG retrieval failed: ${error.message}`);
    }
  },
});

// Helper function to extract text content from document source
function extractTextContent(source: any): string {
  if (typeof source === 'string') {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map(extractTextContent).join(' ');
  }

  if (typeof source === 'object' && source !== null) {
    const textParts: string[] = [];
    
    for (const [key, value] of Object.entries(source)) {
      // Skip metadata fields that aren't content
      if (['id', '_id', 'timestamp', 'created_at', 'updated_at', 'type', 'category'].includes(key)) {
        continue;
      }
      
      const extracted = extractTextContent(value);
      if (extracted && extracted.trim().length > 0) {
        textParts.push(extracted);
      }
    }
    
    return textParts.join(' ');
  }

  return String(source || '');
}

// Helper function to create document chunks
function createChunks(
  content: string,
  chunkSize: number,
  chunkOverlap: number,
  source: { index: string; id: string; score: number },
  metadata?: Record<string, any>
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const sentences = splitIntoSentences(content);
  
  let currentChunk = '';
  let startIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    
    if (potentialChunk.length <= chunkSize) {
      currentChunk = potentialChunk;
    } else {
      // Save current chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          source: { ...source, field: `chunk_${startIndex}` },
          metadata,
        });
      }
      
      // Start new chunk with overlap
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + ' ' + sentence;
        startIndex = i - Math.floor(chunkOverlap / 50); // Approximate sentence index
      } else {
        currentChunk = sentence;
        startIndex = i;
      }
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      source: { ...source, field: `chunk_${startIndex}` },
      metadata,
    });
  }
  
  return chunks;
}

// Helper function to split text into sentences
function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting - can be enhanced with NLP libraries
  const sentences = text
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}
