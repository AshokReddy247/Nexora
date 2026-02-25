/**
 * Next.js API Route: POST /api/export/github
 * Proxies to Flask /export/github — commits code snippets to GitHub.
 */
import { NextRequest, NextResponse } from 'next/server';

const FLASK_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.githubPat || !body.githubRepo) {
            return NextResponse.json(
                { error: 'githubPat and githubRepo are required.' },
                { status: 400 }
            );
        }

        const flaskRes = await fetch(`${FLASK_URL}/export/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await flaskRes.json();
        return NextResponse.json(data, { status: flaskRes.status });
    } catch {
        return NextResponse.json(
            { error: 'GitHub export failed — is the Flask service running?' },
            { status: 503 }
        );
    }
}
