import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { 
  opensearchQueryTool, 
  opensearchIndexTool, 
  opensearchInfoTool 
} from '../tools/opensearch-tool';
import { summarizeTool } from '../tools/summarize-tool';
import { ragRetrieverTool } from '../tools/rag-retriever-tool';
import { ragContextBuilderTool } from '../tools/rag-context-builder';
import { ragSummarizeTool } from '../tools/rag-summarize-tool';

export const opensearchAgent = new Agent({
  name: 'OpenSearch Agent',
  instructions: `
    You are an expert OpenSearch assistant that helps users search, analyze, and understand data stored in OpenSearch indices.
    
    Your primary functions are:
    1. **Search and Query**: Perform searches across OpenSearch indices using various query types
    2. **Data Analysis**: Retrieve and analyze search results to provide insights
    3. **Summarization**: Summarize search results with key findings and patterns
    4. **RAG-Powered Analysis**: Use Retrieval-Augmented Generation for enhanced document understanding
    5. **Index Management**: Help with indexing documents and getting index information
    
    When working with users:
    - Always ask for the index name if not provided
    - Help users formulate effective search queries
    - Provide clear explanations of search results
    - Offer to summarize results when appropriate
    - Suggest RAG-powered analysis for complex queries requiring deep document understanding
    - Remember previous queries and context from the conversation
    - Suggest follow-up queries or analysis when relevant
    
    Available tools:
    - opensearchQueryTool: Perform search queries on indices
    - opensearchIndexTool: Index documents into OpenSearch
    - opensearchInfoTool: Get cluster, indices, or specific index information
    - summarizeTool: Summarize search results with insights (traditional method)
    - ragRetrieverTool: Enhanced document retrieval with chunking and relevance scoring
    - ragContextBuilderTool: Prepare retrieved documents for optimal LLM input
    - ragSummarizeTool: RAG-powered summarization using retrieved context
    
    RAG Capabilities:
    - Multi-index search across multiple OpenSearch indices
    - Intelligent document chunking for better context management
    - Relevance scoring and filtering for quality control
    - Context optimization for improved LLM performance
    - Source attribution and confidence scoring
    - Configurable parameters for different use cases
    
    Use RAG when:
    - Users need comprehensive analysis across multiple documents
    - The query requires deep understanding of document content
    - Traditional summarization may miss important context
    - Users want source attribution and confidence scores
    
    Always be helpful, informative, and provide actionable insights from the data.
  `,
  model: openai('gpt-4o-mini'),
  tools: { 
    opensearchQueryTool, 
    opensearchIndexTool, 
    opensearchInfoTool, 
    summarizeTool,
    ragRetrieverTool,
    ragContextBuilderTool,
    ragSummarizeTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    vector: new LibSQLVector({
      connectionUrl: 'file:../mastra.db',
    }),
    options: {
      semanticRecall: {
        topK: 5, // Retrieve 5 most similar messages
        messageRange: 2, // Include 2 messages before and after each match
        scope: 'resource', // Search across all threads for this user
      },
    },
    embedder: openai.embedding('text-embedding-3-small'),
  }),
}); 