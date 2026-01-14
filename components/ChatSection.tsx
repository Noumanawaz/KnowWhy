import React from 'react';

interface ChatSectionProps {
    question: string;
    setQuestion: (q: string) => void;
    handleAsk: () => void;
    loading: boolean;
    result: any;
    handleReset: () => void;
}

export default function ChatSection({ question, setQuestion, handleAsk, loading, result, handleReset }: ChatSectionProps) {
    return (
        <section className="animate-fade-in" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Ask KnowWhy</h2>
                <button
                    className="glass-btn danger"
                    onClick={handleReset}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                    Reset Knowledge
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                {/* Chat History / Result Area */}
                <div style={{ flex: 1, padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                    {!result && !loading && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <BotIcon size={48} />
                            <p style={{ marginTop: '1rem' }}>Ask me anything about your synced documents.</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <div className="loading-dots">Thinking...</div>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in">
                            {/* User Question */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>U</div>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>You</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{question}</div>
                                </div>
                            </div>

                            {/* AI Answer */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BotIcon size={18} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>KnowWhy AI</div>

                                    <div style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                        {result.answer}
                                    </div>

                                    {/* Sources */}
                                    {result.sources?.length > 0 && (
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', opacity: 0.8 }}>Sources:</div>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {result.sources.map((s: string, i: number) => (
                                                    <li key={i} style={{ marginBottom: '0.25rem', color: 'var(--text-muted)' }}>• {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem', borderTop: 'var(--glass-border)', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Type your question..."
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAsk()}
                        />
                        <button
                            className="glass-btn primary"
                            onClick={handleAsk}
                            disabled={loading || !question}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BotIcon({ size = 24 }: { size?: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
}
function SendIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
}
