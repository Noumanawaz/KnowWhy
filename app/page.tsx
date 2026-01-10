'use client';

import React, { useState } from 'react';

interface AIResponse {
    answer: string;
    explanation: string;
    sources: string[];
    confidence: number;
    gaps: string[];
}

interface Resource {
    id: string;
    name: string;
}

export default function Page() {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);

    // Resource selection state
    const [resources, setResources] = useState<Record<string, Resource[]>>({ slack: [], notion: [], github: [] });
    const [selections, setSelections] = useState<Record<string, string>>({ slack: '', notion: '', github: '' });

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus('Uploading...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/uploadDocument', { method: 'POST', body: formData });
            const data = await res.json();
            setStatus(res.ok ? `Success: Indexed ${data.chunks} chunks` : `Error: ${data.error}`);
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const startOAuth = (provider: string) => {
        const urls: any = {
            slack: `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=channels:history,channels:read,groups:read&redirect_uri=${process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI}`,
            notion: `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI}`,
            github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,issue&redirect_uri=${process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI}`,
        };
        window.location.href = urls[provider];
    };

    const fetchResources = async (provider: string) => {
        setLoading(true);
        setStatus(`Fetching ${provider} resources...`);
        try {
            const res = await fetch(`/api/oauth/${provider}/resources`);
            const data = await res.json();
            if (res.ok) {
                setResources(prev => ({ ...prev, [provider]: data }));
                setStatus(`Found ${data.length} ${provider} resources.`);
            } else { setStatus(`Error: ${data.error}`); }
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const handleSync = async (source: string) => {
        const resourceId = selections[source.toLowerCase()];
        if (!resourceId) { setStatus(`Please select a ${source} resource first`); return; }

        setLoading(true);
        setStatus(`Syncing ${source}...`);
        try {
            const res = await fetch(`/api/sync${source}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId }),
            });
            const data = await res.json();
            setStatus(res.ok ? `Success: Synced ${data.count} documents` : `Error: ${data.error}`);
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const handleAsk = async () => {
        if (!question) return;
        setLoading(true);
        setStatus('Asking...');
        setResult(null);
        try {
            const res = await fetch('/api/askQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            if (res.ok) { setResult(data); setStatus('Done.'); }
            else { setStatus(`Error: ${data.error}`); }
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    return (
        <main>
            <h1>KnowWhy</h1>
            <section>
                <h2>1. Ingest</h2>
                <div>
                    <h3>File</h3>
                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                    <button onClick={handleUpload} disabled={loading || !file}>Upload</button>
                </div>
                <div>
                    <h3>Integrations</h3>
                    {['Slack', 'Notion', 'GitHub'].map(p => {
                        const key = p.toLowerCase();
                        return (
                            <div key={p} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem' }}>
                                <strong>{p}</strong><br />
                                <button onClick={() => startOAuth(key)} style={{ marginRight: '0.5rem' }}>Connect</button>
                                <button onClick={() => fetchResources(key)} disabled={loading} style={{ marginRight: '0.5rem' }}>List Resources</button>

                                {resources[key].length > 0 && (
                                    <>
                                        <select
                                            value={selections[key]}
                                            onChange={e => setSelections(prev => ({ ...prev, [key]: e.target.value }))}
                                            style={{ marginRight: '0.5rem' }}
                                        >
                                            <option value="">Select...</option>
                                            {resources[key].map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                        <button onClick={() => handleSync(p)} disabled={loading || !selections[key]}>Sync Selected</button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
            <section>
                <h2>2. Ask</h2>
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question..." />
                <button onClick={handleAsk} disabled={loading || !question}>Ask</button>
            </section>
            {status && <p><em>{status}</em></p>}
            {result && (
                <section className="results">
                    <p><strong>Answer:</strong> {result.answer}</p>
                    <p><strong>Explanation:</strong> {result.explanation}</p>
                    <p><strong>Sources:</strong> {result.sources.join(', ')}</p>
                    {result.gaps.length > 0 && <p><strong>Gaps:</strong> {result.gaps.join(', ')}</p>}
                </section>
            )}
        </main>
    );
}
