import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { getMCPClient } from '../tools/mcp-client';

// Helper function to make OpenSearch MCP requests
async function makeOpenSearchRequest(action: string, params: any) {
  try {
    const mcpClient = await getMCPClient();
    
    switch (action) {
      case 'search':
        return await mcpClient.search(params.index, params.body, params.size, params.from);
      case 'index':
        return await mcpClient.index(params.index, params.body, params.id);
      case 'info':
      case 'cat.indices':
      case 'indices.get':
        return await mcpClient.getInfo(action, params.index);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('MCP request error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

const searchSchema = z.object({
  index: z.string(),
  query: z.string(),
  size: z.number().optional(),
});

const searchResultSchema = z.object({
  total: z.number(),
  hits: z.array(z.any()),
  took: z.number(),
  timed_out: z.boolean(),
});

const analysisSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()).optional(),
  keyFindings: z.array(z.string()).optional(),
  totalResults: z.number(),
  recommendations: z.array(z.string()).optional(),
});

const searchStep = createStep({
  id: 'search-opensearch',
  description: 'Perform a search query on OpenSearch',
  inputSchema: searchSchema,
  outputSchema: searchResultSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const { index, query, size = 10 } = inputData;

    // Parse query - if it's JSON, use it directly, otherwise create a match query
    let searchQuery;
    try {
      searchQuery = JSON.parse(query);
    } catch {
      // If not valid JSON, create a simple match query
      searchQuery = {
        query: {
          multi_match: {
            query: query,
            fields: ['*'],
            type: 'best_fields',
          },
        },
      };
    }

    const response = await makeOpenSearchRequest('search', {
      index,
      body: {
        ...searchQuery,
        size,
      },
    });

    if (!response.success) {
      throw new Error('OpenSearch MCP search request failed');
    }

    return {
      total: response.data.hits.total.value,
      hits: response.data.hits.hits.map((hit: any) => ({
        _id: hit._id,
        _score: hit._score,
        _source: hit._source,
      })),
      took: response.data.took,
      timed_out: response.data.timed_out,
    };
  },
});

const analyzeStep = createStep({
  id: 'analyze-results',
  description: 'Analyze and summarize search results',
  inputSchema: searchResultSchema,
  outputSchema: analysisSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Search results not found');
    }

    const { total, hits, took } = inputData;

    if (total === 0) {
      return {
        summary: 'No results found for the query.',
        totalResults: 0,
        recommendations: ['Try broadening your search terms', 'Check if the index exists', 'Verify the query syntax'],
      };
    }

    // Prepare the data for analysis
    const resultsText = hits.map((hit, index) => {
      const source = hit._source || hit;
      return `${index + 1}. Score: ${hit._score} - ${JSON.stringify(source, null, 2)}`;
    }).join('\n\n');

    const agent = mastra?.getAgent('opensearchAgent');
    if (!agent) {
      throw new Error('OpenSearch agent not found');
    }

    const prompt = `Analyze the following search results and provide:
1. A comprehensive summary of the findings
2. Key insights about the data
3. Specific findings that stand out
4. Recommendations for follow-up queries or analysis

Search Results (${total} total, took ${took}ms):
${resultsText}

Please provide a structured analysis with clear sections for summary, insights, findings, and recommendations.`;

    const response = await agent.run({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract structured information from the response
    const content = response.content || '';
    
    // Simple parsing of the response to extract insights and recommendations
    const lines = content.split('\n');
    const insights: string[] = [];
    const keyFindings: string[] = [];
    const recommendations: string[] = [];
    
    let currentSection = '';
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().includes('insight')) {
        currentSection = 'insights';
      } else if (trimmedLine.toLowerCase().includes('finding')) {
        currentSection = 'findings';
      } else if (trimmedLine.toLowerCase().includes('recommendation')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const item = trimmedLine.substring(1).trim();
        if (currentSection === 'insights' && item) {
          insights.push(item);
        } else if (currentSection === 'findings' && item) {
          keyFindings.push(item);
        } else if (currentSection === 'recommendations' && item) {
          recommendations.push(item);
        }
      }
    }

    return {
      summary: content,
      insights: insights.length > 0 ? insights : undefined,
      keyFindings: keyFindings.length > 0 ? keyFindings : undefined,
      totalResults: total,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  },
});

export const opensearchWorkflow = createWorkflow({
  id: 'opensearch-workflow',
  inputSchema: z.object({
    index: z.string().describe('The index to search in'),
    query: z.string().describe('The search query'),
    size: z.number().optional().describe('Number of results to return'),
  }),
  outputSchema: analysisSchema,
})
  .then(searchStep)
  .then(analyzeStep);

opensearchWorkflow.commit(); 