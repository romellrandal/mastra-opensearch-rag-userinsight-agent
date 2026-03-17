import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { youtubeTool } from '../tools/youtube-tool.js';

export const youtubeAgent = new Agent({
  name: 'Youtube Agent',
  instructions: `
    You are a helpful assistant that provides accurate YouTube channel information specifically the subscriber count of a channel.
Your primary function is to help users get the latest number of subscriber of a YouTube channel:
The user can provide a name or a username (e.g.: @mrbeast)
Always ask for a username if no username is provided
Keep the response as concise as possible`,
  model: openai('gpt-4o-mini'),
  tools: { youtubeTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    vector: new LibSQLVector({
      connectionUrl: 'file:../mastra.db',
    }),
    options: {
      semanticRecall: {
        topK: 3, // Retrieve 3 most similar messages
        messageRange: 2, // Include 2 messages before and after each match
        scope: 'resource', // Search across all threads for this user
      },
    },
    embedder: openai.embedding('text-embedding-3-small'),
  }),
});
