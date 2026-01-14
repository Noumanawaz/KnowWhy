import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    activeTab: 'dashboard' | 'workspace';
    onTabChange: (tab: 'dashboard' | 'workspace') => void;
    user: any;
    onLogout: () => void;
}

export default function Layout({ children, activeTab, onTabChange, user, onLogout }: LayoutProps) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="glass-panel" style={{
                width: '260px',
                margin: '1rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: 'calc(100vh - 2rem)',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }}>
                        KnowWhy
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        AI Knowledge Explainer
                    </p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <NavButton
                        active={activeTab === 'dashboard'}
                        onClick={() => onTabChange('dashboard')}
                        icon={<DashboardIcon />}
                    >
                        How it Works
                    </NavButton>
                    <NavButton
                        active={activeTab === 'workspace'}
                        onClick={() => onTabChange('workspace')}
                        icon={<WorkspaceIcon />}
                    >
                        Workspace
                    </NavButton>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 'bold', color: 'white'
                        }}>
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Connected
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="glass-btn"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            padding: '0.6rem',
                            color: '#f87171',
                            borderColor: 'rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.05)'
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: '280px',
                flex: 1,
                padding: '2rem',
                maxWidth: '1200px',
                width: '100%'
            }}>
                {children}
            </main>
        </div>
    );
}

function NavButton({ children, active, onClick, icon }: any) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.875rem 1rem',
                border: 'none',
                background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: active ? '600' : '400',
                transition: 'all 0.2s',
                textAlign: 'left'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            {icon}
            {children}
        </button>
    );
}

// Simple Inline SVG Icons
function DashboardIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
    );
}

function WorkspaceIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
    );
}
