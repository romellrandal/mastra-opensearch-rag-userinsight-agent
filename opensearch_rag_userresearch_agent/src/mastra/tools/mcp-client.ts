import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP Client for OpenSearch
export class OpenSearchMCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['src/mastra/mcp-server/opensearch-mcp-server.js'],
      env: {
        OPENSEARCH_HOSTS: process.env.OPENSEARCH_HOSTS || 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
        OPENSEARCH_USERNAME: process.env.OPENSEARCH_USERNAME || 'pbaiadmin',
        OPENSEARCH_PASSWORD: process.env.OPENSEARCH_PASSWORD || 'HPfYP.kv4kEaVGp',
        OPENSEARCH_VERIFY_CERTS: process.env.OPENSEARCH_VERIFY_CERTS || 'true',
      },
    });

    this.client = new Client({
      name: 'opensearch-mcp-client',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });
  }

  async initialize() {
    await this.client.connect(this.transport);
  }

  async search(index: string, query: any, size: number = 10, from: number = 0) {
    try {
      const response = await this.client.callTool({
        name: 'search',
        arguments: {
          index,
          body: {
            ...query,
            size,
            from,
          },
        },
      });

      return {
        success: true,
        data: response.content[0].text ? JSON.parse(response.content[0].text) : response.content[0],
      };
    } catch (error) {
      console.error('MCP search error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async index(index: string, document: any, id?: string) {
    try {
      const response = await this.client.callTool({
        name: 'index',
        arguments: {
          index,
          id,
          body: document,
        },
      });

      return {
        success: true,
        data: response.content[0].text ? JSON.parse(response.content[0].text) : response.content[0],
      };
    } catch (error) {
      console.error('MCP index error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getInfo(action: string, index?: string) {
    try {
      const response = await this.client.callTool({
        name: action,
        arguments: index ? { index } : {},
      });

      return {
        success: true,
        data: response.content[0].text ? JSON.parse(response.content[0].text) : response.content[0],
      };
    } catch (error) {
      console.error('MCP info error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async close() {
    await this.client.close();
  }
}

// Singleton instance
let mcpClient: OpenSearchMCPClient | null = null;

export async function getMCPClient(): Promise<OpenSearchMCPClient> {
  if (!mcpClient) {
    mcpClient = new OpenSearchMCPClient();
    await mcpClient.initialize();
  }
  return mcpClient;
} 