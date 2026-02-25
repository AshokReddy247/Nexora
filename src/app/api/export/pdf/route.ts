/**
 * Next.js API Route: POST /api/export/pdf
 * Proxies to Flask /export/pdf and streams the PDF bytes back to the client.
 */
import { NextRequest, NextResponse } from 'next/server';

const FLASK_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const flaskRes = await fetch(`${FLASK_URL}/export/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!flaskRes.ok) {
            const err = await flaskRes.text();
            return NextResponse.json({ error: err }, { status: flaskRes.status });
        }

        const pdfBuffer = await flaskRes.arrayBuffer();
        const mode = body.mode ?? 'session';
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="nexor-${mode}-export.pdf"`,
            },
        });
    } catch (e) {
        return NextResponse.json(
            { error: 'PDF export failed — is the Flask service running?' },
            { status: 503 }
        );
    }
}
