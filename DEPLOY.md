# Deploying KnowWhy to Coolify

This guide details how to deploy the **KnowWhy** application to your Coolify instance.

## Prerequisites

1.  A **Coolify** instance installed and running.
2.  This project pushed to a **GitHub Repository** (private or public).

## Step 1: Database Setup (PostgreSQL + pgvector)

KnowWhy requires a PostgreSQL database with the `pgvector` extension enabled.

1.  In Coolify, go to your Project environment.
2.  Click **+ New Resource** -> **Database** -> **PostgreSQL**.
3.  Name it (e.g., `knowwhy-db`).
4.  Once created, go to the database **Configuration** (or check the logs/terminal for it) and connect to it using a tool (like TablePlus) or the built-in console to run:
    ```sql
    CREATE EXTENSION vector;
    ```
    *Note: Coolify's default Postgres image usually supports extensions, but you must enable it explicitly.*

5.  **Copy the Connection String** (Internal URL if deploying in the same Coolify instance, or Public URL if external).
    *   Format: `postgresql://user:password@host:port/database`

## Step 2: Application Deployment

1.  In your Coolify Project, click **+ New Resource** -> **Git Repository** (or **Private Repository** if your repo is private).
2.  Select your repository: `.../KnowWhy`.
3.  **Configuration**:
    *   **Build Pack**: Select `Docker` (It will automatically detect the `Dockerfile` in the root).
    *   **Port**: `3000` (The Dockerfile exposes port 3000).

4.  **Environment Variables**:
    Go to the **Environment Variables** tab and add the following secrets. **These are critical.**

    ```env
    # Database (Use the connection string from Step 1)
    DATABASE_URL="postgresql://user:password@host:port/database"

    # Auth & Security
    JWT_SECRET="generate-a-long-random-string-here"
    
    # AI (Gemini)
    GOOGLE_API_KEY="your-gemini-api-key"

    # Integrations (Reuse your existing credentials or create new production apps)
    NEXT_PUBLIC_SLACK_CLIENT_ID="..."
    NEXT_PUBLIC_SLACK_REDIRECT_URI="https://your-coolify-domain.com"
    SLACK_BOT_TOKEN="..."
    
    NEXT_PUBLIC_NOTION_CLIENT_ID="..."
    NEXT_PUBLIC_NOTION_REDIRECT_URI="https://your-coolify-domain.com"
    NOTION_CLIENT_SECRET="..."
    
    NEXT_PUBLIC_GITHUB_CLIENT_ID="..."
    NEXT_PUBLIC_GITHUB_REDIRECT_URI="https://your-coolify-domain.com"
    GITHUB_CLIENT_SECRET="..."
    ```

    *Important: Update your Redirect URIs in your Slack/Notion/GitHub App settings to match your new deployed domain (e.g., `https://knowwhy.your-domain.com`).*

5.  **Build & Deploy**:
    *   Click **Deploy**.
    *   Watch the build logs. It should pull the node image, install dependencies, run `prisma generate`, build the Next.js app, and start the server.

6.  **Post-Deployment**:
    *   Once the container is healthy/running, Coolify will provide a domain (or you can configured a custom one in "Settings").
    *   Open the URL. You should see the login/app.

## Troubleshooting

*   **Database connection error**: Check your `DATABASE_URL`. If using internal networking (Coolify default), ensure the hostname matches the service name of your database.
*   **Vector error**: Ensure you ran `CREATE EXTENSION vector;` in the database.
*   **Build fails on memory**: If the build crashes, try increasing the build resource limits or enabling swap on your server.
