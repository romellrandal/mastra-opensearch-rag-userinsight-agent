import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

export const ragSummarizeTool = createTool({
  id: 'rag-summarize',
  description: 'RAG-powered summarization using retrieved context for comprehensive and accurate summaries',
  inputSchema: z.object({
    query: z.string().describe('The original user query for summarization'),
    context: z.string().describe('Retrieved context from RAG retriever'),
    sources: z.array(z.object({
      index: z.string(),
      id: z.string(),
      score: z.number(),
      field: z.string().optional(),
      contentPreview: z.string(),
    })).describe('Source references for the context'),
    maxLength: z.number().optional().describe('Maximum length of summary (default: 800)'),
    includeInsights: z.boolean().optional().describe('Whether to include insights and findings (default: true)'),
    includeSources: z.boolean().optional().describe('Whether to include source references (default: true)'),
    confidenceThreshold: z.number().optional().describe('Minimum confidence for including insights (default: 0.7)'),
  }),
  outputSchema: z.object({
    summary: z.string().describe('Generated summary using RAG context'),
    insights: z.array(z.string()).optional().describe('Key insights extracted from the context'),
    keyFindings: z.array(z.string()).optional().describe('Specific findings from the documents'),
    sources: z.array(z.object({
      index: z.string(),
      id: z.string(),
      score: z.number(),
      relevance: z.string(),
      contribution: z.string(),
    })).describe('Source document contributions to the summary'),
    confidence: z.number().describe('Confidence score for the summary (0-1)'),
    contextUtilization: z.object({
      chunksUsed: z.number(),
      totalChunks: z.number(),
      contextLength: z.number(),
      coverageScore: z.number(),
    }).describe('How well the context was utilized'),
    processingTime: z.number().describe('Total processing time in milliseconds'),
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();
    
    try {
      const {
        query,
        context: retrievedContext,
        sources,
        maxLength = 800,
        includeInsights = true,
        includeSources = true,
        confidenceThreshold = 0.7,
      } = context;

      if (!retrievedContext || retrievedContext.trim() === 'No relevant documents found.') {
        return {
          summary: 'No relevant documents found to generate a summary.',
          sources: [],
          confidence: 0,
          contextUtilization: {
            chunksUsed: 0,
            totalChunks: 0,
            contextLength: 0,
            coverageScore: 0,
          },
          processingTime: Date.now() - startTime,
        };
      }

      // Step 1: Generate RAG-powered summary
      const summaryPrompt = `You are an expert at analyzing and summarizing information using retrieved document context.

User Query: "${query}"

Retrieved Document Context:
${retrievedContext}

Please provide a comprehensive summary that:
1. Directly addresses the user's query
2. Synthesizes information from the retrieved documents
3. Highlights the most relevant findings
4. Maintains accuracy by staying close to the source material
5. Provides actionable insights when possible

Keep the summary under ${maxLength} characters and make it informative, well-structured, and directly relevant to the query.`;

      const summaryResponse = await openai('gpt-4o-mini').generateText({
        prompt: summaryPrompt,
        maxTokens: maxLength * 2,
      });

      const summary = summaryResponse.text.trim();

      // Step 2: Extract insights and findings if requested
      let insights: string[] = [];
      let keyFindings: string[] = [];

      if (includeInsights) {
        const insightsPrompt = `Based on the summary and context above, provide:

1. 3-5 key insights about the information
2. 3-5 specific findings that stand out

Focus on insights that are directly supported by the retrieved documents.

Format as:
INSIGHTS:
- [insight 1]
- [insight 2]

FINDINGS:
- [finding 1]
- [finding 2]`;

        const insightsResponse = await openai('gpt-4o-mini').generateText({
          prompt: insightsPrompt,
          maxTokens: 400,
        });

        const insightsText = insightsResponse.text.trim();
        
        // Parse insights and findings
        const lines = insightsText.split('\n');
        let currentSection = '';
        
        for (const line of lines) {
          if (line.startsWith('INSIGHTS:')) {
            currentSection = 'insights';
          } else if (line.startsWith('FINDINGS:')) {
            currentSection = 'findings';
          } else if (line.trim().startsWith('-') && currentSection) {
            const item = line.trim().substring(1).trim();
            if (currentSection === 'insights' && item) {
              insights.push(item);
            } else if (currentSection === 'findings' && item) {
              keyFindings.push(item);
            }
          }
        }
      }

      // Step 3: Analyze source contributions
      const analyzedSources = analyzeSourceContributions(sources, query, confidenceThreshold);

      // Step 4: Calculate confidence score
      const confidence = calculateConfidenceScore(sources, summary, query);

      // Step 5: Calculate context utilization metrics
      const contextUtilization = calculateContextUtilization(retrievedContext, sources);

      const processingTime = Date.now() - startTime;

      return {
        summary,
        insights: insights.length > 0 ? insights : undefined,
        keyFindings: keyFindings.length > 0 ? keyFindings : undefined,
        sources: analyzedSources,
        confidence,
        contextUtilization,
        processingTime,
      };
    } catch (error) {
      console.error('RAG summarization error:', error);
      throw new Error(`RAG summarization failed: ${error.message}`);
    }
  },
});

// Helper function to analyze source contributions
function analyzeSourceContributions(
  sources: Array<{
    index: string;
    id: string;
    score: number;
    field?: string;
    contentPreview: string;
  }>,
  query: string,
  confidenceThreshold: number
): Array<{
  index: string;
  id: string;
  score: number;
  relevance: string;
  contribution: string;
}> {
  return sources.map(source => {
    // Determine relevance level based on score
    let relevance: string;
    if (source.score >= 8) {
      relevance = 'High';
    } else if (source.score >= 5) {
      relevance = 'Medium';
    } else {
      relevance = 'Low';
    }

    // Determine contribution type based on content preview
    let contribution: string;
    const preview = source.contentPreview.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    const termMatches = queryTerms.filter(term => preview.includes(term)).length;
    const matchRatio = termMatches / queryTerms.length;
    
    if (matchRatio >= 0.8) {
      contribution = 'Primary';
    } else if (matchRatio >= 0.5) {
      contribution = 'Supporting';
    } else {
      contribution = 'Contextual';
    }

    return {
      index: source.index,
      id: source.id,
      score: source.score,
      relevance,
      contribution,
    };
  });
}

// Helper function to calculate confidence score
function calculateConfidenceScore(
  sources: Array<{
    index: string;
    id: string;
    score: number;
    field?: string;
    contentPreview: string;
  }>,
  summary: string,
  query: string
): number {
  if (sources.length === 0) {
    return 0;
  }

  // Base confidence from source quality
  const averageScore = sources.reduce((sum, source) => sum + source.score, 0) / sources.length;
  const scoreConfidence = Math.min(1.0, averageScore / 10); // Normalize to 0-1

  // Source coverage confidence
  const coverageConfidence = Math.min(1.0, sources.length / 5); // More sources = higher confidence

  // Query alignment confidence
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const summaryTerms = summary.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  const queryTermMatches = queryTerms.filter(term => summaryTerms.includes(term)).length;
  const alignmentConfidence = queryTerms.length > 0 ? queryTermMatches / queryTerms.length : 0;

  // Weighted combination
  const confidence = (
    scoreConfidence * 0.4 +
    coverageConfidence * 0.3 +
    alignmentConfidence * 0.3
  );

  return Math.round(confidence * 100) / 100;
}

// Helper function to calculate context utilization metrics
function calculateContextUtilization(
  context: string,
  sources: Array<{
    index: string;
    id: string;
    score: number;
    field?: string;
    contentPreview: string;
  }>
): {
  chunksUsed: number;
  totalChunks: number;
  contextLength: number;
  coverageScore: number;
} {
  // Count chunks in context
  const chunkMatches = context.match(/\[Chunk \d+\]/g);
  const chunksUsed = chunkMatches ? chunkMatches.length : 0;
  
  // Estimate total chunks based on source count
  const totalChunks = sources.length;
  
  // Context length
  const contextLength = context.length;
  
  // Coverage score
  const coverageScore = totalChunks > 0 ? Math.min(1.0, chunksUsed / totalChunks) : 0;

  return {
    chunksUsed,
    totalChunks,
    contextLength,
    coverageScore: Math.round(coverageScore * 100) / 100,
  };
}
