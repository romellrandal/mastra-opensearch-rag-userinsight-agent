import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPConnection() {
  try {
    console.log('Testing direct MCP connection to OpenSearch...');
    
    // Create MCP client
    const transport = new StdioClientTransport({
      command: 'opensearch-mcp-server',
      args: ['--transport', 'stdio'],
      env: {
        OPENSEARCH_HOSTS: 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
        OPENSEARCH_USERNAME: 'pbaiadmin',
        OPENSEARCH_PASSWORD: 'HPfYP.kv4kEaVGp',
        OPENSEARCH_VERIFY_CERTS: 'true',
      },
    });

    const client = new Client({
      name: 'opensearch-mcp-client',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    console.log('Initializing MCP client...');
    await client.connect(transport);
    console.log('MCP Client connected successfully');
    
    // Test cluster info
    console.log('\n=== Testing Cluster Info ===');
    try {
      const clusterInfo = await client.callTool({
        name: 'info',
        arguments: {},
      });
      console.log('Cluster Info Response:', clusterInfo);
    } catch (error) {
      console.error('Cluster info error:', error);
    }
    
    // Test indices listing
    console.log('\n=== Testing Indices Listing ===');
    try {
      const indicesInfo = await client.callTool({
        name: 'cat.indices',
        arguments: { format: 'json' },
      });
      console.log('Indices Info Response:', indicesInfo);
    } catch (error) {
      console.error('Indices info error:', error);
    }
    
    // Test search
    console.log('\n=== Testing Search ===');
    try {
      const searchResult = await client.callTool({
        name: 'search',
        arguments: {
          index: 'test-index',
          body: {
            query: {
              match_all: {}
            },
            size: 5
          }
        },
      });
      console.log('Search Result:', searchResult);
    } catch (error) {
      console.error('Search error:', error);
    }
    
    await client.close();
    console.log('\nMCP Connection test completed successfully');
    
  } catch (error) {
    console.error('Error testing MCP connection:', error);
  }
}

// Run the test
testMCPConnection(); 