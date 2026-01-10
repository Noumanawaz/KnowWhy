import React, { ReactNode } from 'react';
import '../styles/global.css';

export const metadata = {
    title: 'KnowWhy - AI Knowledge Explainer',
    description: 'AI-powered company knowledge explainer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
