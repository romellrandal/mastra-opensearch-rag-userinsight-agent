# OpenSearch Agent for Mastra

This is a proof-of-concept agent built using Mastra's Agent Framework that connects to OpenSearch, performs queries, retrieves search results, and summarizes them.

## Features

- **OpenSearch MCP Integration**: Connects to OpenSearch via MCP server
- **Query Execution**: Performs various types of search queries
- **Result Summarization**: Uses AI to summarize and analyze search results
- **Memory Management**: Retains context between interactions
- **Tool-based Architecture**: Uses dedicated tools for different operations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file with your OpenSearch MCP server configuration:

```env
# OpenSearch MCP Server Configuration
OPENSEARCH_HOSTS=https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com
OPENSEARCH_USERNAME=pbaiadmin
OPENSEARCH_PASSWORD=HPfYP.kv4kEaVGp
OPENSEARCH_VERIFY_CERTS=true

# OpenAI Configuration (for summarization)
OPENAI_API_KEY=your_openai_api_key
```

### 3. OpenSearch MCP Server Setup

The agent is configured to connect to the OpenSearch MCP server with the following configuration:

```json
{
  "opensearch": {
    "command": "opensearch-mcp-server",
    "args": ["--transport", "stdio"],
    "env": {
      "OPENSEARCH_HOSTS": "https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com",
      "OPENSEARCH_USERNAME": "pbaiadmin",
      "OPENSEARCH_PASSWORD": "HPfYP.kv4kEaVGp",
      "OPENSEARCH_VERIFY_CERTS": "true"
    }
  }
}
```

## Agent Architecture

### Tools

1. **opensearchQueryTool**: Performs search queries on OpenSearch indices
   - Supports JSON queries and simple text queries
   - Configurable result size and pagination
   - Returns structured search results

2. **opensearchIndexTool**: Indexes documents into OpenSearch
   - Supports custom document IDs
   - Handles document indexing operations

3. **opensearchInfoTool**: Retrieves cluster and index information
   - Cluster health and status
   - Index listing and details
   - Specific index information

4. **summarizeTool**: Summarizes search results using AI
   - Provides comprehensive summaries
   - Extracts key insights and findings
   - Configurable summary length

### Agent Configuration

The OpenSearch agent is configured with:
- **Memory**: Uses LibSQLStore for persistent context retention
- **Model**: OpenAI GPT-4o-mini for reasoning and summarization
- **Tools**: All four OpenSearch-related tools
- **Instructions**: Comprehensive guidelines for search and analysis

## Usage Examples

### Basic Search

```javascript
import { opensearchAgent } from './.mastra/output/index.mjs';

const response = await opensearchAgent.run({
  messages: [
    {
      role: 'user',
      content: 'Search for documents containing "error" in the logs index'
    }
  ]
});
```

### Search with Summarization

```javascript
const response = await opensearchAgent.run({
  messages: [
    {
      role: 'user',
      content: 'Search for user activity in the analytics index and summarize the results'
    }
  ]
});
```

### Complex Query

```javascript
const response = await opensearchAgent.run({
  messages: [
    {
      role: 'user',
      content: 'Find documents in the products index where price is greater than 100 and category is electronics'
    }
  ]
});
```

## Query Types Supported

1. **Simple Text Queries**: Natural language search across all fields
2. **JSON Queries**: Advanced OpenSearch query DSL
3. **Filtered Queries**: Range, term, and boolean filters
4. **Aggregation Queries**: Statistical analysis and grouping

## Memory and Context

The agent maintains conversation context through:
- **Conversation History**: Previous queries and responses
- **Search Context**: Index preferences and query patterns
- **User Preferences**: Summarization style and detail level
- **Semantic Recall**: Intelligent memory retrieval based on meaning similarity

### Semantic Recall Features

The OpenSearch agent includes semantic recall capabilities:

- **Vector Embeddings**: Uses OpenAI's text-embedding-3-small for message embeddings
- **Similarity Search**: Retrieves semantically similar past conversations
- **Context Window**: Includes surrounding messages for better context
- **Cross-Thread Search**: Can recall information from all user conversations
- **Configurable Retrieval**: 
  - `topK: 5` - Retrieve 5 most similar messages
  - `messageRange: 2` - Include 2 messages before and after each match
  - `scope: 'resource'` - Search across all threads for the user

## Testing

Run the test script to verify the agent functionality:

```bash
npm run dev  # Build the project first
node test-opensearch-agent.js
```

### Testing Semantic Recall

To test semantic recall functionality:

```bash
node test-semantic-recall.js
```

This test demonstrates how the agent can recall semantically similar conversations:
1. **Initial Conversations**: Creates conversations about errors, user activity, and performance
2. **Semantic Recall**: Asks about "problems" and "logs" to trigger semantic recall
3. **Context Retrieval**: Shows how the agent recalls relevant past conversations

The agent will retrieve semantically similar messages from previous conversations when the current query has similar meaning, even if the exact words don't match.

## Configuration Options

### OpenSearch MCP Server Configuration

The OpenSearch MCP server can be configured via environment variables:

- `OPENSEARCH_HOSTS`: OpenSearch server hosts (default: https://search-search-pbai-v2-k4glba3awvjmfeslkhrl3ya2lu.us-east-1.es.amazonaws.com)
- `OPENSEARCH_USERNAME`: Authentication username (default: pbaiadmin)
- `OPENSEARCH_PASSWORD`: Authentication password (default: HPfYP.kv4kEaVGp)
- `OPENSEARCH_VERIFY_CERTS`: Whether to verify SSL certificates (default: true)

### Summarization Options

The summarization tool supports:
- `maxLength`: Maximum summary length (default: 500 characters)
- `includeInsights`: Whether to include insights and findings (default: true)

## Error Handling

The agent includes comprehensive error handling for:
- Connection failures to OpenSearch
- Invalid query syntax
- Missing indices
- Authentication errors
- Summarization failures

## Security Considerations

- SSL certificate validation is disabled for development
- Authentication credentials should be properly secured
- Consider using environment variables for sensitive configuration
- Implement proper access controls for production use

## Future Enhancements

Potential improvements:
- Support for OpenSearch security plugins
- Advanced query suggestions
- Result visualization tools
- Batch processing capabilities
- Custom aggregation tools
- Real-time monitoring integration 