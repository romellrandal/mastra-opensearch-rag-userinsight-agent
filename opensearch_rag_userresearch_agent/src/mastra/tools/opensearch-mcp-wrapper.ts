import { Client } from '@opensearch-project/opensearch';

// OpenSearch MCP-like wrapper
export class OpenSearchMCPWrapper {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_HOSTS || 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
      auth: {
        username: process.env.OPENSEARCH_USERNAME || 'pbaiadmin',
        password: process.env.OPENSEARCH_PASSWORD || 'HPfYP.kv4kEaVGp',
      },
      ssl: {
        rejectUnauthorized: process.env.OPENSEARCH_VERIFY_CERTS === 'true',
      },
    });
  }

  async search(index: string, query: any, size: number = 10, from: number = 0) {
    try {
      const response = await this.client.search({
        index,
        body: {
          ...query,
          size,
          from,
        },
      });

      return {
        success: true,
        data: {
          total: response.body.hits.total.value,
          hits: response.body.hits.hits.map((hit: any) => ({
            _id: hit._id,
            _score: hit._score,
            _source: hit._source,
          })),
          took: response.body.took,
          timed_out: response.body.timed_out,
        },
      };
    } catch (error) {
      console.error('OpenSearch search error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async index(index: string, document: any, id?: string) {
    try {
      const response = await this.client.index({
        index,
        id,
        body: document,
      });

      return {
        success: true,
        data: {
          _id: response.body._id,
          result: response.body.result,
          _version: response.body._version,
        },
      };
    } catch (error) {
      console.error('OpenSearch index error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getInfo(action: string, index?: string) {
    try {
      let response;
      
      switch (action) {
        case 'info':
          response = await this.client.info();
          break;
        case 'cat.indices':
          response = await this.client.cat.indices({ format: 'json' });
          break;
        case 'indices.get':
          if (!index) {
            throw new Error('Index name is required for indices.get action');
          }
          response = await this.client.indices.get({ index });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        data: response.body,
      };
    } catch (error) {
      console.error('OpenSearch info error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async close() {
    // Client doesn't need explicit closing
  }
}

// Singleton instance
let mcpWrapper: OpenSearchMCPWrapper | null = null;

export async function getMCPWrapper(): Promise<OpenSearchMCPWrapper> {
  if (!mcpWrapper) {
    mcpWrapper = new OpenSearchMCPWrapper();
  }
  return mcpWrapper;
}
