
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { opensearchWorkflow } from './workflows/opensearch-workflow';
import { weatherAgent } from './agents/weather-agent';
import { youtubeAgent } from './agents/youtube-agent';
import { opensearchAgent } from './agents/opensearch-agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, opensearchWorkflow },
  agents: { weatherAgent, youtubeAgent, opensearchAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
