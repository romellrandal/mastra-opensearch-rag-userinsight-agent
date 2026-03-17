## mastra-opensearch-rag-userinsight-agent

An experiment in building a **user research copilot** that can:

- ingest raw qualitative inputs (interviews, calls, support tickets, surveys),
- structure and index them in **OpenSearch**, and
- answer nuanced questions about users, problems, and product fit using **Retrieval-Augmented Generation (RAG)**.

The goal is to move from scattered notes and recordings to **searchable, explainable user insight workflows**.

---

### Problem this project is trying to solve

Product and research teams often have:

- Large volumes of **unstructured feedback** (call transcripts, interviews, tickets, NPS comments).
- Insights locked away in **meeting notes and docs** that are hard to rediscover.
- Repeated, manual analysis work (e.g. “find all mentions of onboarding friction in the last 3 months”).

We want an agent that can:

- Quickly answer questions like:
  - “What are the top pain points mentioned by PLG users in the last month?”
  - “Show me quotes about pricing confusion for enterprise customers.”
  - “How have complaints about onboarding changed over time?”
- Provide **grounded answers with citations** to original sources.
- Help teams **synthesize patterns**, not just regurgitate single documents.

---

### Why RAG (Retrieval-Augmented Generation)?

We use RAG instead of prompting a model directly because:

- **Grounding in real data**: Answers should be tightly linked to **actual user artifacts**, not model hallucinations.
- **Scalability**: As the volume of research grows, RAG lets us retrieve only the relevant chunks rather than stuffing everything into a prompt.
- **Traceability**: RAG makes it easy to show **which transcripts, notes, or tickets** an answer came from.
- **Domain adaptation**: We can keep a lightweight model but still get domain-aware responses by retrieving highly relevant context.

Conceptually, each query goes through:

1. **Retrieval**: Find the most relevant pieces of user research from OpenSearch.
2. **Augmentation**: Build a prompt that includes those snippets, plus any metadata (user segments, time ranges, product areas).
3. **Generation**: Ask the LLM to answer, summarize, or synthesize – while staying grounded in the retrieved context.

---

### Why OpenSearch?

OpenSearch is a good fit here because:

- **Search + analytics**: It combines full-text search with aggregations, which is useful for:
  - frequency counts,
  - trend analysis,
  - segment breakdowns (e.g. by plan, cohort, region).
- **Vector search support**: We can store embeddings for semantically similar passages and run hybrid search (text + vector).
- **Scalability**: Designed to handle large volumes of documents and queries.
- **Open and self-hostable**: Suitable for environments where data sensitivity / compliance matters.

We expect to store each **user research artifact** as one or more documents with:

- Raw text content (transcript segments, note snippets, ticket bodies).
- Embeddings for semantic search.
- Metadata such as:
  - user / account identifiers (hashed/pseudonymized where appropriate),
  - product area or feature,
  - source (interview, call, ticket, survey),
  - timestamps and tags.

---

### High-level architecture (intended)

Planned components:

- **Ingestion pipeline**
  - Adapters to pull data from sources (e.g. call transcripts, CSV exports, ticket systems).
  - Chunking and cleaning of long texts.
  - Embedding generation for chunks.
  - Indexing into OpenSearch with metadata.

- **Query & insight layer**
  - API / agent entrypoint that accepts natural language questions.
  - Retrieval from OpenSearch (keyword, vector, or hybrid).
  - RAG orchestration to build prompts and call the LLM.
  - Answer formatting with citations to original snippets.

- **(Optional) UI**
  - A simple interface to:
    - ask questions,
    - browse retrieved snippets,
    - see sources and tags,
    - save/share insight reports.

---

### Repository contents (current)

Right now this repo is only a **skeleton** to be filled in:

- `README.md`: This conceptual overview and design intent.
- `.gitignore`: Excludes build artifacts and sensitive files (such as environment variables and keys, including `.env`, `*.key`, certs, etc.).

No source code or infrastructure definitions are committed yet.

---

### Getting started locally

1. **Clone the repository**

```bash
git clone https://github.com/romellrandal/mastra-opensearch-rag-userinsight-agent.git
cd mastra-opensearch-rag-userinsight-agent
```

2. **Create a `.env` file (not committed)**

Add configuration values such as:

- OpenSearch connection settings (host, port, username/password or IAM/other auth).
- LLM API keys.
- Any other integration credentials.

> **Important:** Never commit `.env`, API keys, or credentials. They are explicitly excluded by `.gitignore`.

3. **Incrementally add components**

As the project evolves, you can:

- Add ingestion scripts or services (e.g. `ingestion/`).
- Add RAG orchestration logic (e.g. `agent/` or `services/`).
- Add a simple CLI or web UI (e.g. `app/` or `ui/`).

Update this `README.md` with:

- concrete data models,
- example queries,
- deployment notes,
- and operational guidelines as you build them out.


