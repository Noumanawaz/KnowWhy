import React from 'react';

export default function Dashboard() {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    How KnowWhy Works
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    See inside the brain of your AI assistant. Watch how raw data is transformed into intelligent answers.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                <StepCard
                    step="1"
                    title="Ingest & Split"
                    desc="Documents from Slack, Notion, and GitHub are fetched and split into small, manageable text chunks."
                    icon={<FileIcon />}
                    color="var(--accent-cyan)"
                    delay="0s"
                />
                <StepCard
                    step="2"
                    title="Embed"
                    desc="Google's Gemini AI converts text chunks into vector embeddings - numerical representations of meaning."
                    icon={<BrainIcon />}
                    color="var(--accent-blue)"
                    delay="0.1s"
                />
                <StepCard
                    step="3"
                    title="Store & Index"
                    desc="Vectors are stored in a high-speed index, ready for semantic similarity search."
                    icon={<DatabaseIcon />}
                    color="var(--accent-purple)"
                    delay="0.2s"
                />
                <StepCard
                    step="4"
                    title="Retrieve & Generate"
                    desc="Relevant chunks are retrieved based on your question, and Gemini generates a precise answer using them."
                    icon={<SparklesIcon />}
                    color="var(--accent-pink)"
                    delay="0.3s"
                />
            </div>

            <header style={{ marginTop: '5rem', marginBottom: '3rem', textAlign: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    Supported Integrations
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Seamlessly connect your knowledge bases.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                <IntegrationCard
                    name="Slack"
                    desc="Ingests public channels and message history to answer questions about team discussions."
                    icon={<SlackIcon />}
                    color="#E01E5A"
                />
                <IntegrationCard
                    name="Notion"
                    desc="Syncs pages and databases to provide answers from your wikis and docs."
                    icon={<NotionIcon />}
                    color="#ffffff"
                />
                <IntegrationCard
                    name="GitHub"
                    desc="Reads READMEs and Issues to explain codebases and project context."
                    icon={<GitHubIcon />}
                    color="#2dba4e"
                />
            </div>

            <div className="glass-panel" style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Powered by Advanced Tech</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                    <span>Next.js 14</span>
                    <span>•</span>
                    <span>Google Gemini Pro</span>
                    <span>•</span>
                    <span>Vector Search</span>
                    <span>•</span>
                    <span>Oauth 2.0</span>
                </div>
            </div>
        </div>
    );
}

function StepCard({ step, title, desc, icon, color, delay }: any) {
    return (
        <div className="glass-panel" style={{
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            animation: `fadeIn 0.5s ease-out forwards ${delay}`,
            opacity: 0
        }}>
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                fontSize: '6rem',
                fontWeight: '900',
                color: color,
                opacity: 0.1,
                lineHeight: 1
            }}>
                {step}
            </div>

            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                marginBottom: '1.5rem'
            }}>
                {icon}
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
        </div>
    );
}

function IntegrationCard({ name, desc, icon, color }: any) {
    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            transition: 'transform 0.2s',
            cursor: 'default'
        }}>
            <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '8px',
                background: `rgba(255,255,255,0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{desc}</p>
            </div>
        </div>
    );
}

function SlackIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.52v2.522h-2.52zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
}

function NotionIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l9.916-.746c1.353-.092 1.4.154 1.307 1.492l-2.428 12.046c-.093.886-.327 1.073-1.12.98l-9.102-.934c-.886-.093-1.073-.606-.886-1.54l1.884-11.764zM1.868 6.57c-.234 1.166-.35 2.753.84 4.013l.863 8.356c.234 2.193 1.284 3.01 3.432 2.706l12.42-2.006c1.938-.256 2.592-1.376 2.92-3.15L23.95 2.128c.187-1.166-1.12-1.633-2.38-1.586L6.537 2.405C4.202 2.592 1.938 1.962 1.868 6.57zm16.48-1.516c-.046-.233-.28-.35-.513-.326l-7.796.887c-.233.023-.42.233-.373.49l.07.49c.046.21.28.35.513.326l7.796-.887c.234-.046.42-.233.35-.49l-.046-.49zm-8.87 2.31l-.256 1.307c-.07.396.186.606.513.56l7.7-1.144c.303-.092.443-.302.513-.7l.256-1.306c.07-.397-.186-.607-.513-.56l-7.7 1.144c-.303.093-.443.303-.513.7z" /></svg>
}

function GitHubIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
}

// Existing helper components...
function FileIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
}
function BrainIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>
}
function DatabaseIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path></svg>
}
function SparklesIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
}
