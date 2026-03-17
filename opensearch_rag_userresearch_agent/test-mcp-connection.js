import { getMCPClient } from './.mastra/output/index.mjs';

async function testMCPConnection() {
  try {
    console.log('Testing MCP Connection to OpenSearch...');
    
    const mcpClient = await getMCPClient();
    console.log('MCP Client initialized successfully');
    
    // Test cluster info
    console.log('\n=== Testing Cluster Info ===');
    const clusterInfo = await mcpClient.getInfo('info');
    console.log('Cluster Info:', clusterInfo);
    
    // Test indices listing
    console.log('\n=== Testing Indices Listing ===');
    const indicesInfo = await mcpClient.getInfo('cat.indices');
    console.log('Indices Info:', indicesInfo);
    
    // Test search (this will likely return no results if no data exists)
    console.log('\n=== Testing Search ===');
    const searchResult = await mcpClient.search('test-index', {
      query: {
        match_all: {}
      }
    }, 5);
    console.log('Search Result:', searchResult);
    
    await mcpClient.close();
    console.log('\nMCP Connection test completed successfully');
    
  } catch (error) {
    console.error('Error testing MCP connection:', error);
  }
}

// Run the test
testMCPConnection(); 