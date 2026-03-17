import { Client } from '@opensearch-project/opensearch';

async function testOpenSearchDirect() {
  try {
    console.log('Testing OpenSearch Direct Connection (MCP-like)...');
    
    // Create OpenSearch client
    const client = new Client({
      node: 'https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com',
      auth: {
        username: 'pbaiadmin',
        password: 'HPfYP.kv4kEaVGp',
      },
      ssl: {
        rejectUnauthorized: true,
      },
    });
    
    console.log('✅ OpenSearch Client initialized successfully');
    
    // Test cluster info
    console.log('\n=== Testing Cluster Info ===');
    try {
      const clusterInfo = await client.info();
      console.log('✅ Cluster Info Response:', clusterInfo.body);
    } catch (error) {
      console.error('❌ Cluster info error:', error);
    }
    
    // Test indices listing
    console.log('\n=== Testing Indices Listing ===');
    try {
      const indicesInfo = await client.cat.indices({ format: 'json' });
      console.log('✅ Indices Info Response:', indicesInfo.body);
    } catch (error) {
      console.error('❌ Indices info error:', error);
    }
    
    // Test search
    console.log('\n=== Testing Search ===');
    try {
      const searchResult = await client.search({
        index: 'test-index',
        body: {
          query: {
            match_all: {}
          },
          size: 5
        }
      });
      console.log('✅ Search Result:', searchResult.body);
    } catch (error) {
      console.error('❌ Search error:', error);
    }
    
    console.log('\n✅ OpenSearch Direct Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing OpenSearch connection:', error);
  }
}

// Run the test
testOpenSearchDirect();
