import { getMCPWrapper } from './src/mastra/tools/opensearch-mcp-wrapper.ts';

async function testMCPWrapper() {
  try {
    console.log('Testing OpenSearch MCP Wrapper...');
    
    const wrapper = await getMCPWrapper();
    console.log('✅ MCP Wrapper initialized successfully');
    
    // Test cluster info
    console.log('\n=== Testing Cluster Info ===');
    try {
      const clusterInfo = await wrapper.getInfo('info');
      if (clusterInfo.success) {
        console.log('✅ Cluster Info Response:', clusterInfo.data);
      } else {
        console.error('❌ Cluster info error:', clusterInfo.error);
      }
    } catch (error) {
      console.error('❌ Cluster info error:', error);
    }
    
    // Test indices listing
    console.log('\n=== Testing Indices Listing ===');
    try {
      const indicesInfo = await wrapper.getInfo('cat.indices');
      if (indicesInfo.success) {
        console.log('✅ Indices Info Response:', indicesInfo.data);
      } else {
        console.error('❌ Indices info error:', indicesInfo.error);
      }
    } catch (error) {
      console.error('❌ Indices info error:', error);
    }
    
    // Test search
    console.log('\n=== Testing Search ===');
    try {
      const searchResult = await wrapper.search('test-index', {
        query: {
          match_all: {}
        }
      }, 5);
      
      if (searchResult.success) {
        console.log('✅ Search Result:', searchResult.data);
      } else {
        console.error('❌ Search error:', searchResult.error);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
    }
    
    console.log('\n✅ MCP Wrapper test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing MCP wrapper:', error);
  }
}

// Run the test
testMCPWrapper();
