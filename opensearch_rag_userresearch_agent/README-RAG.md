# RAG Integration for OpenSearch Agent

This document describes the Retrieval-Augmented Generation (RAG) integration for the OpenSearch-based research summarization agent using Mastra.

## Overview

The RAG integration enhances the existing OpenSearch agent by providing:

- **Enhanced Document Retrieval**: Multi-index search with intelligent chunking and relevance scoring
- **Context Optimization**: Smart context building for optimal LLM input
- **RAG-Powered Summarization**: Context-aware summarization with source attribution
- **Performance Metrics**: Confidence scoring and optimization metrics
- **Flexible Configuration**: Multiple preset configurations for different use cases

## Architecture

```
User Query → RAG Retriever → Context Builder → RAG Summarizer → Enhanced Summary
     ↓              ↓              ↓              ↓              ↓
  Query        Document      Optimized      LLM with      Summary +
  Input       Chunks +      Context        Context       Sources +
              Scores                       Input         Confidence
```

### Components

1. **RAG Retriever Tool** (`rag-retriever-tool.ts`)
   - Multi-index OpenSearch search
   - Document chunking with configurable overlap
   - Relevance scoring and filtering
   - Metadata preservation

2. **RAG Context Builder** (`rag-context-builder.ts`)
   - Smart chunk selection and ordering
   - Context length optimization
   - Query-focused content prioritization
   - Optimization metrics calculation

3. **RAG Summarizer Tool** (`rag-summarize-tool.ts`)
   - Context-aware LLM prompting
   - Source attribution and analysis
   - Confidence scoring
   - Insights and findings extraction

4. **RAG Integration** (`rag-integration.ts`)
   - Orchestrates the entire pipeline
   - Provides preset configurations
   - Error handling and fallbacks
   - Performance monitoring

## Quick Start

### 1. Basic RAG Summarization

```typescript
import { simpleRAGSummarize } from './src/mastra/tools/rag-integration';

const result = await simpleRAGSummarize(
  ["logs", "analytics"], 
  "system performance analysis"
);

console.log(result.summary);
console.log(`Confidence: ${result.confidence}`);
console.log(`Sources: ${result.sources.length}`);
```

### 2. Research-Quality RAG

```typescript
import { researchRAGSummarize } from './src/mastra/tools/rag-integration';

const result = await researchRAGSummarize(
  ["logs", "analytics", "performance"], 
  "comprehensive system analysis"
);

console.log(result.insights);
console.log(result.keyFindings);
console.log(result.optimizationMetrics);
```

### 3. Custom RAG Configuration

```typescript
import { summarize_with_rag } from './src/mastra/tools/rag-integration';

const result = await summarize_with_rag({
  indices: ["logs", "analytics"],
  query: "user authentication patterns",
  maxResults: 25,
  chunkSize: 800,
  chunkOverlap: 150,
  relevanceThreshold: 0.4,
  maxContextLength: 12000,
  includeSources: true,
  includeInsights: true,
  confidenceThreshold: 0.8
});
```

## Configuration Options

### RAG Retriever Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxResults` | 20 | Maximum documents to retrieve |
| `chunkSize` | 1000 | Document chunk size in characters |
| `chunkOverlap` | 200 | Overlap between chunks |
| `relevanceThreshold` | 0.3 | Minimum relevance score (0-1) |
| `includeMetadata` | true | Include document metadata |

### Context Builder Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxContextLength` | 8000 | Maximum context length for LLM |
| `prioritizeRelevance` | true | Sort chunks by relevance score |
| `includeMetadata` | false | Include metadata in context |
| `queryFocus` | true | Focus context on query relevance |

### RAG Summarizer Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxLength` | 800 | Maximum summary length |
| `includeInsights` | true | Extract key insights |
| `includeSources` | true | Include source references |
| `confidenceThreshold` | 0.7 | Minimum confidence for insights |

## Preset Configurations

### 1. Simple RAG (`simpleRAGSummarize`)
- **Use Case**: Quick summaries with basic RAG benefits
- **Configuration**: Balanced performance and quality
- **Best For**: Daily operations and quick analysis

### 2. Research RAG (`researchRAGSummarize`)
- **Use Case**: Comprehensive research and analysis
- **Configuration**: High quality with detailed insights
- **Best For**: Research papers, detailed reports, deep analysis

### 3. Fast RAG (`fastRAGSummarize`)
- **Use Case**: Quick results with minimal processing
- **Configuration**: Optimized for speed over quality
- **Best For**: Real-time applications, resource-constrained environments

## API Reference

### Main Function: `summarize_with_rag`

```typescript
interface RAGSummarizeInput {
  indices: string[];           // List of OpenSearch indices
  query: string;               // User query for summarization
  maxResults?: number;         // Maximum documents to retrieve
  chunkSize?: number;          // Document chunk size
  chunkOverlap?: number;       // Overlap between chunks
  relevanceThreshold?: number; // Minimum relevance score
  maxContextLength?: number;   // Maximum context length
  includeSources?: boolean;    // Include source references
  includeInsights?: boolean;   // Include insights and findings
  confidenceThreshold?: number; // Minimum confidence for insights
}

interface RAGSummarizeOutput {
  summary: string;             // Generated summary
  sources: SourceReference[];  // Source document references
  confidence: number;          // Confidence score (0-1)
  retrievedCount: number;      // Number of documents retrieved
  contextLength: number;       // Actual context length used
  processingTime: number;      // Total processing time in ms
  insights?: string[];         // Key insights extracted
  keyFindings?: string[];      // Specific findings
  optimizationMetrics?: {      // Context optimization metrics
    relevanceScore: number;
    coverageScore: number;
    efficiencyScore: number;
  };
}
```

## Testing

### Run RAG Comparison Test

```bash
# JavaScript version
npm run test:rag

# Python version
npm run test:rag-python

# Run examples
npm run example:rag
```

### Test Output

The test compares traditional summarization vs RAG-powered summarization:

- **Performance Metrics**: Processing time comparison
- **Quality Metrics**: Results count, confidence scores
- **RAG Optimization**: Relevance, coverage, and efficiency scores
- **Summary Comparison**: Side-by-side output comparison
- **Source Analysis**: Document contribution analysis
- **Recommendations**: When to use each approach

## Integration with Existing Agent

The RAG tools are automatically integrated into the OpenSearch agent:

```typescript
// The agent now has access to all RAG tools
const agent = mastra.getAgent('opensearchAgent');

// Users can request RAG-powered analysis
const response = await agent.run({
  messages: [{
    role: 'user',
    content: 'Use RAG to analyze system performance across logs and analytics indices'
  }]
});
```

## Performance Considerations

### Memory Usage
- **Document Chunking**: Reduces memory footprint for large documents
- **Context Optimization**: Prevents context overflow in LLM
- **Streaming**: Processes documents in chunks rather than loading all at once

### Processing Time
- **RAG Pipeline**: Adds 100-300ms overhead for enhanced processing
- **Chunking**: Minimal impact (10-50ms) for document processing
- **Context Building**: 50-150ms for context optimization
- **LLM Generation**: Similar to traditional summarization

### Scalability
- **Multi-Index**: Efficiently searches across multiple indices
- **Parallel Processing**: Can process multiple queries concurrently
- **Caching**: Results can be cached for repeated queries
- **Resource Management**: Configurable limits prevent resource exhaustion

## Error Handling

### Graceful Degradation
- **RAG Failures**: Falls back to traditional summarization
- **OpenSearch Errors**: Provides detailed error messages
- **LLM Failures**: Returns partial results when possible
- **Timeout Handling**: Configurable timeouts for long-running operations

### Error Types
- **Connection Errors**: OpenSearch connectivity issues
- **Query Errors**: Invalid search parameters
- **Processing Errors**: Document chunking or context building failures
- **LLM Errors**: AI model generation failures

## Best Practices

### 1. Index Selection
- Choose relevant indices for your query
- Avoid searching unnecessary indices
- Consider index size and update frequency

### 2. Query Formulation
- Use specific, descriptive queries
- Include relevant keywords and terms
- Avoid overly broad or vague queries

### 3. Configuration Tuning
- Start with preset configurations
- Adjust parameters based on your data characteristics
- Monitor performance metrics for optimization

### 4. Error Monitoring
- Log RAG pipeline performance
- Monitor confidence scores
- Track processing times and resource usage

## Troubleshooting

### Common Issues

1. **Low Confidence Scores**
   - Increase `relevanceThreshold`
   - Adjust `chunkSize` and `chunkOverlap`
   - Review query specificity

2. **Long Processing Times**
   - Reduce `maxResults`
   - Decrease `maxContextLength`
   - Use `fastRAGSummarize` preset

3. **Poor Summary Quality**
   - Check document relevance scores
   - Verify index content quality
   - Adjust `confidenceThreshold`

4. **Memory Issues**
   - Reduce `chunkSize`
   - Lower `maxResults`
   - Enable streaming for large datasets

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
// Set environment variable for debug logging
process.env.RAG_DEBUG = 'true';

// Run with verbose output
const result = await summarize_with_rag({
  // ... configuration
  debug: true
});
```

## Future Enhancements

### Planned Features
- **Vector Search**: Semantic similarity search using embeddings
- **Hybrid Search**: Combine keyword and semantic search
- **Real-time Updates**: Live document indexing and retrieval
- **Advanced Chunking**: Semantic boundary detection
- **Multi-language Support**: Internationalization for global use

### Performance Improvements
- **Async Processing**: Non-blocking document retrieval
- **Result Caching**: Intelligent caching strategies
- **Batch Operations**: Process multiple queries efficiently
- **Resource Pooling**: Optimize memory and CPU usage

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm run test:rag`

### Code Style
- Follow TypeScript best practices
- Use consistent error handling
- Add comprehensive documentation
- Include unit tests for new features

### Testing Guidelines
- Test with various document types
- Validate performance metrics
- Ensure error handling works correctly
- Test edge cases and boundary conditions

## License

This RAG integration is part of the OpenSearch Agent project and follows the same licensing terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the test examples
3. Examine the error logs
4. Create an issue with detailed information

---

**Note**: This RAG integration is designed to work with the existing OpenSearch infrastructure and Mastra framework. Ensure compatibility with your OpenSearch version and Mastra installation.
