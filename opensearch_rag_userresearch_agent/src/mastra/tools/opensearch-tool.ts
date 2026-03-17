import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Client } from '@opensearch-project/opensearch';

// OpenSearch client configuration
const client = new Client({
  node: process.env.OPENSEARCH_HOSTS || 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'pbaiadmin',
    password: process.env.OPENSEARCH_PASSWORD || 'HPfYP.kv4kEaVGp',
  },
  ssl: {
    rejectUnauthorized: process.env.OPENSEARCH_VERIFY_CERTS === 'true',
  },
});

export const opensearchQueryTool = createTool({
  id: 'opensearch-query',
  description: 'Perform a search query on OpenSearch and retrieve results',
  inputSchema: z.object({
    index: z.string().describe('The index to search in'),
    query: z.string().describe('The search query (can be JSON or text)'),
    size: z.number().optional().describe('Number of results to return (default: 10)'),
    from: z.number().optional().describe('Starting offset for pagination (default: 0)'),
  }),
  outputSchema: z.object({
    total: z.number(),
    hits: z.array(z.any()),
    took: z.number(),
    timed_out: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const { index, query, size = 10, from = 0 } = context;
      
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

      const response = await client.search({
        index,
        body: {
          ...searchQuery,
          size,
          from,
        },
      });

      return {
        total: response.body.hits.total.value,
        hits: response.body.hits.hits.map((hit: any) => ({
          _id: hit._id,
          _score: hit._score,
          _source: hit._source,
        })),
        took: response.body.took,
        timed_out: response.body.timed_out,
      };
    } catch (error) {
      console.error('OpenSearch query error:', error);
      throw new Error(`OpenSearch query failed: ${error.message}`);
    }
  },
});

export const opensearchIndexTool = createTool({
  id: 'opensearch-index',
  description: 'Index a document into OpenSearch',
  inputSchema: z.object({
    index: z.string().describe('The index to index the document into'),
    id: z.string().optional().describe('Document ID (optional, will be auto-generated if not provided)'),
    document: z.any().describe('The document to index'),
  }),
  outputSchema: z.object({
    _id: z.string(),
    result: z.string(),
    _version: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      const { index, id, document } = context;
      
      const response = await client.index({
        index,
        id,
        body: document,
      });

      return {
        _id: response.body._id,
        result: response.body.result,
        _version: response.body._version,
      };
    } catch (error) {
      console.error('OpenSearch index error:', error);
      throw new Error(`OpenSearch indexing failed: ${error.message}`);
    }
  },
});

export const opensearchInfoTool = createTool({
  id: 'opensearch-info',
  description: 'Get information about OpenSearch cluster and indices',
  inputSchema: z.object({
    action: z.enum(['cluster', 'indices', 'index']).describe('Type of information to retrieve'),
    index: z.string().optional().describe('Index name (required for index action)'),
  }),
  outputSchema: z.object({
    info: z.any(),
  }),
  execute: async ({ context }) => {
    try {
      const { action, index } = context;
      
      let response;
      switch (action) {
        case 'cluster':
          response = await client.info();
          break;
        case 'indices':
          response = await client.cat.indices({ format: 'json' });
          break;
        case 'index':
          if (!index) {
            throw new Error('Index name is required for index action');
          }
          response = await client.indices.get({ index });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        info: response.body,
      };
    } catch (error) {
      console.error('OpenSearch info error:', error);
      throw new Error(`OpenSearch info failed: ${error.message}`);
    }
  },
}); 