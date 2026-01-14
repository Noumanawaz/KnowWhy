import React from 'react';

interface IngestSectionProps {
    file: File | null;
    setFile: (f: File | null) => void;
    handleUpload: () => void;
    loading: boolean;
    startOAuth: (provider: string) => void;
    fetchResources: (provider: string) => void;
    handleSync: (provider: string) => void;
    resources: Record<string, any[]>;
    selections: Record<string, string>;
    setSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    connected: Record<string, boolean>;
    status: string;
}

export default function IngestSection({
    file, setFile, handleUpload, loading,
    startOAuth, fetchResources, handleSync, resources, selections, setSelections, connected, status
}: IngestSectionProps) {

    return (
        <section className="animate-fade-in">
            <h2 className="section-title">Ingest Knowledge</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* File Upload Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UploadIcon /> Document Upload
                    </h3>
                    {/* ... upload UI ... */}
                    <div
                        style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: '12px',
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            transition: 'border 0.2s'
                        }}
                        onClick={() => document.getElementById('file-upload')?.click()}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                        onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        onDrop={e => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                        }}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? (
                            <span style={{ color: 'var(--accent-blue)' }}>{file.name}</span>
                        ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Drag & drop or click to upload PDF/TXT</span>
                        )}
                    </div>
                    <button
                        className="glass-btn primary"
                        style={{ width: '100%' }}
                        onClick={handleUpload}
                        disabled={loading || !file}
                    >
                        {loading ? 'Processing...' : 'Upload & Index'}
                    </button>
                </div>

                {/* Integrations Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlugIcon /> Integrations
                    </h3>

                    {/* Status Message Display */}
                    {(status.includes('Error') || status.includes('permissions') || status.includes('Success') || status.includes('Syncing') || status.includes('Fetching') || status.includes('Uploading') || status.includes('Found') || status.includes('Please select')) && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            background: (status.includes('Error') || status.includes('permissions')) ? 'rgba(239, 68, 68, 0.1)' : status.includes('Success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            border: `1px solid ${(status.includes('Error') || status.includes('permissions')) ? 'rgba(239, 68, 68, 0.2)' : status.includes('Success') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                            color: (status.includes('Error') || status.includes('permissions')) ? '#f87171' : status.includes('Success') ? '#4ade80' : '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {(status.includes('Error') || status.includes('permissions')) ? <span style={{ fontSize: '1.2rem' }}>⚠</span> : status.includes('Success') ? <span style={{ fontSize: '1.2rem' }}>✓</span> : <span style={{ fontSize: '1.2rem' }}>ℹ️</span>}
                            {status}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Slack', 'Notion', 'GitHub'].map(p => {
                            const key = p.toLowerCase();
                            const hasResources = resources[key]?.length > 0;

                            return (
                                <div key={p} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasResources ? '1rem' : 0 }}>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)' }}></div>
                                            {p}
                                            <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block', marginLeft: '5px', cursor: 'help' }}>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>ℹ️</span>
                                                <div className="tooltip-text" style={{
                                                    visibility: 'hidden',
                                                    width: '240px',
                                                    backgroundColor: '#1e293b',
                                                    color: '#fff',
                                                    textAlign: 'center',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    position: 'absolute',
                                                    zIndex: 1,
                                                    bottom: '125%',
                                                    left: '50%',
                                                    marginLeft: '-120px',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s',
                                                    fontSize: '0.75rem',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                                }}>
                                                    {p === 'Slack' && 'Connect to Slack workspace to index public channels. Requires "channels:history" permission.'}
                                                    {p === 'Notion' && 'Connect to Notion workspace. Select pages to share with the integration to index them.'}
                                                    {p === 'GitHub' && 'Connect to GitHub account. Select repositories to index code, issues, and PRs.'}
                                                </div>
                                                <style jsx>{`
                                                    .tooltip-container:hover .tooltip-text {
                                                        visibility: visible !important;
                                                        opacity: 1 !important;
                                                    }
                                                `}</style>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={`glass-btn ${connected[key] ? 'success' : ''}`}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                onClick={() => startOAuth(key)}
                                            >
                                                Connect
                                            </button>
                                            {key !== 'notion' && (
                                                <button className="glass-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetchResources(key)} disabled={loading}>
                                                    Fetch
                                                </button>
                                            )}
                                            {key === 'notion' && (
                                                <button className="glass-btn primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSync(key)} disabled={loading}>
                                                    Sync All
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Resource Selection Dropdown & Sync Button */}
                                    {hasResources && key !== 'notion' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <select
                                                className="glass-input"
                                                style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                                value={selections[key] || ''}
                                                onChange={e => setSelections(prev => ({ ...prev, [key]: e.target.value }))}
                                            >
                                                <option value="" style={{ color: 'black' }}>Select resource...</option>
                                                {resources[key].map(r => (
                                                    <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="glass-btn primary"
                                                style={{ padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
                                                disabled={loading || !selections[key]}
                                                onClick={() => handleSync(key)}
                                            >
                                                Sync
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function UploadIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
}
function PlugIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-6.57l-1 1-2.76-2.76 1-1H3.82l-1.41 1.41a2 2 0 0 0 0 2.83l3.35 3.35a2 2 0 0 0 2.83 0l1.41-1.41"></path><path d="M12 2v6.57l1-1 2.76 2.76-1 1h5.42l1.41-1.41a2 2 0 0 0 0-2.83l-3.35-3.35a2 2 0 0 0-2.83 0l-1.41 1.41"></path></svg>
}
