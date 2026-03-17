import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

export const summarizeTool = createTool({
  id: 'summarize-results',
  description: 'Summarize search results and provide insights',
  inputSchema: z.object({
    results: z.array(z.object({
      _id: z.string().optional(),
      _score: z.number().optional(),
      _source: z.any().optional(),
    })).describe('The search results to summarize'),
    query: z.string().describe('The original query that produced these results'),
    maxLength: z.number().optional().describe('Maximum length of summary (default: 500)'),
    includeInsights: z.boolean().optional().describe('Whether to include insights and patterns (default: true)'),
  }),
  outputSchema: z.object({
    summary: z.string(),
    insights: z.array(z.string()).optional(),
    keyFindings: z.array(z.string()).optional(),
    totalResults: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const { results, query, maxLength = 500, includeInsights = true } = context;
      
      if (!results || results.length === 0) {
        return {
          summary: 'No results found for the query.',
          totalResults: 0,
        };
      }

      // Prepare the data for summarization
      const resultsText = results.map((result, index) => {
        const source = result._source || result;
        return `${index + 1}. ${JSON.stringify(source, null, 2)}`;
      }).join('\n\n');

      const prompt = `You are an expert at analyzing and summarizing search results. 
      
Query: "${query}"

Search Results:
${resultsText}

Please provide a comprehensive summary of these results. Focus on:
1. Key themes and patterns
2. Most relevant findings
3. Important insights
4. Any notable trends or outliers

${includeInsights ? 'Also provide specific insights and key findings as separate lists.' : ''}

Keep the summary under ${maxLength} characters and make it informative and actionable.`;

      const response = await openai('gpt-4o-mini').generateText({
        prompt,
        maxTokens: maxLength * 2, // Allow for longer generation
      });

      const summary = response.text.trim();

      // Extract insights if requested
      let insights: string[] = [];
      let keyFindings: string[] = [];

      if (includeInsights) {
        const insightsPrompt = `Based on the search results above, provide:
1. 3-5 key insights about the data
2. 3-5 specific findings that stand out

Format as:
INSIGHTS:
- [insight 1]
- [insight 2]

FINDINGS:
- [finding 1]
- [finding 2]`;

        const insightsResponse = await openai('gpt-4o-mini').generateText({
          prompt: insightsPrompt,
          maxTokens: 300,
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
            if (currentSection === 'insights') {
              insights.push(item);
            } else if (currentSection === 'findings') {
              keyFindings.push(item);
            }
          }
        }
      }

      return {
        summary,
        insights: insights.length > 0 ? insights : undefined,
        keyFindings: keyFindings.length > 0 ? keyFindings : undefined,
        totalResults: results.length,
      };
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error(`Summarization failed: ${error.message}`);
    }
  },
}); 