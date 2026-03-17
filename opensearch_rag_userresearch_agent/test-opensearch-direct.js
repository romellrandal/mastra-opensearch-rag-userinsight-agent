import { Client } from '@opensearch-project/opensearch';

async function testOpenSearchDirect() {
  try {
    console.log('Testing direct OpenSearch connection...');
    
    // Create OpenSearch client with your configuration
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

    console.log('OpenSearch client created, testing connection...');
    
    // Test 1: Get cluster info
    console.log('\n=== Test 1: Get cluster info ===');
    try {
      const clusterInfo = await client.info();
      console.log('Cluster Info:', clusterInfo.body);
    } catch (error) {
      console.error('Cluster info error:', error);
    }
    
    // Test 2: Get indices
    console.log('\n=== Test 2: Get indices ===');
    try {
      const indicesInfo = await client.cat.indices({ format: 'json' });
      console.log('Indices Info:', indicesInfo.body);
    } catch (error) {
      console.error('Indices info error:', error);
    }
    
    // Test 3: Search (this will likely return no results if no data exists)
    console.log('\n=== Test 3: Search test ===');
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
      console.log('Search Result:', searchResult.body);
    } catch (error) {
      console.error('Search error:', error);
    }
    
    console.log('\nOpenSearch direct connection test completed');
    
  } catch (error) {
    console.error('Error testing OpenSearch direct connection:', error);
  }
}

// Run the test
testOpenSearchDirect(); 