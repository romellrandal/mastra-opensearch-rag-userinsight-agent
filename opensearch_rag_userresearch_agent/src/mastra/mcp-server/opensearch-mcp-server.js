#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@opensearch-project/opensearch';

// OpenSearch client
const opensearchClient = new Client({
  node: process.env.OPENSEARCH_HOSTS || 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'pbaiadmin',
    password: process.env.OPENSEARCH_PASSWORD || 'HPfYP.kv4kEaVGp',
  },
  ssl: {
    rejectUnauthorized: process.env.OPENSEARCH_VERIFY_CERTS === 'true',
  },
});

// Create MCP server
const server = new Server(
  {
    name: 'opensearch-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools = [
  {
    name: 'search',
    description: 'Search documents in OpenSearch',
    inputSchema: {
      type: 'object',
      properties: {
        index: { type: 'string', description: 'Index to search in' },
        body: { type: 'object', description: 'Search query body' },
        size: { type: 'number', description: 'Number of results to return' },
        from: { type: 'number', description: 'Starting offset' },
      },
      required: ['index', 'body'],
    },
  },
  {
    name: 'index',
    description: 'Index a document in OpenSearch',
    inputSchema: {
      type: 'object',
      properties: {
        index: { type: 'string', description: 'Index to index into' },
        id: { type: 'string', description: 'Document ID (optional)' },
        body: { type: 'object', description: 'Document to index' },
      },
      required: ['index', 'body'],
    },
  },
  {
    name: 'info',
    description: 'Get OpenSearch cluster information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cat.indices',
    description: 'List all indices',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', description: 'Output format (json, text)' },
      },
    },
  },
];

// Handle tool listing
server.setRequestHandler('tools/list', async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'search':
        result = await opensearchClient.search({
          index: args.index,
          body: args.body,
          size: args.size || 10,
          from: args.from || 0,
        });
        break;

      case 'index':
        result = await opensearchClient.index({
          index: args.index,
          id: args.id,
          body: args.body,
        });
        break;

      case 'info':
        result = await opensearchClient.info();
        break;

      case 'cat.indices':
        result = await opensearchClient.cat.indices({
          format: args.format || 'json',
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.body, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`Error in tool ${name}:`, error);
    throw new Error(`OpenSearch operation failed: ${error.message}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('OpenSearch MCP Server started');
