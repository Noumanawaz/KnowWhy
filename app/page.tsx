'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import IngestSection from '@/components/IngestSection';
import ChatSection from '@/components/ChatSection';

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
    const [activeTab, setActiveTab] = useState<'dashboard' | 'workspace'>('workspace');

    // Workspace State
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);
    const [resources, setResources] = useState<Record<string, Resource[]>>({ slack: [], notion: [], github: [] });
    const [selections, setSelections] = useState<Record<string, string>>({ slack: '', notion: '', github: '' });
    const [connected, setConnected] = useState<Record<string, boolean>>({ slack: false, notion: false, github: false });
    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Fetch user info
                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }

                const res = await fetch('/api/status');
                if (res.ok) {
                    const status = await res.json();
                    setConnected(status);
                }
            } catch (e) { console.error('Failed to fetch status', e); }
        };
        fetchStatus();
    }, []);

    // Handlers
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (e) { console.error('Logout failed', e); }
    };

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
            if (res.ok) setFile(null); // Clear file after success
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const startOAuth = (provider: string) => {
        const urls: any = {
            slack: `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=channels:history,channels:read,groups:read,groups:history,users:read&redirect_uri=${process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI}`,
            notion: `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI}`,
            github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,issue&redirect_uri=${process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI}`,
        };
        window.location.href = urls[provider];
    };

    const fetchResources = async (provider: string) => {
        setLoading(true);
        setStatus(`Fetching ${provider} resources...`);
        try {
            const res = await fetch(`/api/oauth/${provider.toLowerCase()}/resources`);
            const data = await res.json();
            if (res.ok) {
                setResources(prev => ({ ...prev, [provider]: data }));
                setStatus(`Found ${data.length} ${provider} resources.`);
            } else {
                if (data.error === 'token_expired') {
                    setStatus(`⚠️ Session expired: Please reconnect ${provider}.`);
                    setConnected(prev => ({ ...prev, [provider.toLowerCase()]: false }));
                } else {
                    setStatus(`Error: ${data.error}`);
                }
            }
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const handleSync = async (source: string) => {
        const resourceId = selections[source.toLowerCase()];
        if (source.toLowerCase() !== 'notion' && !resourceId) {
            setStatus(`Please select a ${source} resource first`);
            return;
        }

        setLoading(true);
        setStatus(`Syncing ${source}...`);

        let endpoint = `/api/sync${source.toLowerCase()}`;
        if (source.toLowerCase() === 'github') {
            endpoint = '/api/sync-github-repo';
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(`Success: Synced ${data.count} items from ${source}`);
            } else {
                if (JSON.stringify(data.error).includes('missing_scope')) {
                    setStatus(`⚠️ permissions error: Please click "Connect" on ${source} again to update permissions.`);
                } else if (data.error === 'token_expired' || JSON.stringify(data.error).includes('token_expired')) {
                    setStatus(`⚠️ Session expired: Please reconnect ${source}.`);
                    setConnected(prev => ({ ...prev, [source.toLowerCase()]: false }));
                } else {
                    setStatus(`Error: ${data.error}`);
                }
            }
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const handleAsk = async () => {
        if (!question) return;
        setLoading(true);
        setStatus('');
        setResult(null);
        try {
            const res = await fetch('/api/askQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            if (res.ok) { setResult(data); }
            else { setStatus(`Error: ${data.error}`); }
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to clear all knowledge? This cannot be undone.')) return;
        setLoading(true);
        try {
            await fetch('/api/reset', { method: 'POST' });
            setStatus('Knowledge base cleared');
            setResult(null);
        } catch (err: any) { setStatus(`Error: ${err.message}`); }
        finally { setLoading(false); }
    };

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
            {activeTab === 'dashboard' ? (
                <Dashboard />
            ) : (
                <div className="animate-fade-in">
                    <IngestSection
                        file={file}
                        setFile={setFile}
                        handleUpload={handleUpload}
                        loading={loading}
                        startOAuth={startOAuth}
                        fetchResources={fetchResources}
                        handleSync={handleSync}
                        resources={resources}
                        selections={selections}
                        setSelections={setSelections}
                        connected={connected}
                        status={status}
                    />

                    <ChatSection
                        question={question}
                        setQuestion={setQuestion}
                        handleAsk={handleAsk}
                        loading={loading}
                        result={result}
                        handleReset={handleReset}
                    />

                    {/* Status Toast */}
                    {status && (
                        <div style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            zIndex: 100,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            color: 'white',
                            maxWidth: '300px',
                            fontSize: '0.9rem'
                        }}>
                            {status}
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
