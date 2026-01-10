# KnowWhy MVP

KnowWhy is an AI-powered company knowledge explainer. It ingests documents and data from Slack, Notion, and GitHub, and allows users to ask questions about them using a Retrieval-Augmented Generation (RAG) pipeline powered by Google Gemini.

## Features

-   **Multi-Source Ingestion**: Sync knowledge from:
    -   **Files**: PDF, Markdown, TXT.
    -   **Slack**: User-selected channels (requires bot invite).
    -   **Notion**: User-selected databases.
    -   **GitHub**: READMEs and Issues from user-selected repositories.
-   **RAG Pipeline**:
    -   Content chunking with overlap.
    -   In-memory vector store with cosine similarity search.
    -   Embeddings via `text-embedding-004`.
-   **Explainable AI**: Answers queries with `gemini-2.0-flash` providing:
    -   Concise answers.
    -   Explanations of the reasoning.
    -   Citations of specific sources (e.g., "Slack Message 171...", "GitHub Issue #42").
    -   Identification of knowledge gaps.
-   **Secure OAuth**: Connect your own accounts; tokens are persisted locally in `.tokens.json` (server-side only).

## Setup

1.  **Clone the repo**:
    ```bash
    git clone <your-repo-url>
    cd KnowWhy
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory (see `.env.example` logic below) with your API keys:
    ```env
    gemini_api_key=...

    # OAuth Credentials (Backend)
    SLACK_CLIENT_ID=...
    SLACK_CLIENT_SECRET=...
    SLACK_REDIRECT_URI=https://<your-ngrok>.ngrok-free.app/api/oauth/slack

    NOTION_CLIENT_ID=...
    NOTION_CLIENT_SECRET=...
    NOTION_REDIRECT_URI=https://<your-ngrok>.ngrok-free.app/api/oauth/notion

    GITHUB_CLIENT_ID=...
    GITHUB_CLIENT_SECRET=...
    GITHUB_REDIRECT_URI=https://<your-ngrok>.ngrok-free.app/api/oauth/github

    # Client-Side Exposure (Required for "Connect" buttons)
    NEXT_PUBLIC_SLACK_CLIENT_ID=...
    NEXT_PUBLIC_SLACK_REDIRECT_URI=...
    NEXT_PUBLIC_NOTION_CLIENT_ID=...
    NEXT_PUBLIC_NOTION_REDIRECT_URI=...
    NEXT_PUBLIC_GITHUB_CLIENT_ID=...
    NEXT_PUBLIC_GITHUB_REDIRECT_URI=...
    ```

4.  **Run with ngrok (Required for OAuth)**:
    Start ngrok to create an HTTPS tunnel:
    ```bash
    ngrok http 3000
    ```
    *Ensure your `.env` redirect URIs match this ngrok URL.*

5.  **Start the App**:
    ```bash
    npm run dev
    ```
    Open your **ngrok URL** (e.g., `https://xxxx.ngrok-free.app`) in the browser.

## Architecture

-   **Frontend**: Next.js App Router (`/app`), React, Minimal CSS.
-   **Backend**: Next.js API Routes (`/app/api`).
-   **Integrations**: Custom readers in `/lib/integrations` using official SDKs (`@slack/web-api`, `@notionhq/client`, `octokit`).
-   **Storage**:
    -   **Vectors**: In-memory (reset on restart).
    -   **Tokens**: Local filesystem (`.tokens.json`).

## License

MIT
