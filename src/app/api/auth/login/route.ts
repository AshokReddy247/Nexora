import { NextRequest, NextResponse } from 'next/server';

const DJANGO_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const res = await fetch(`${DJANGO_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: 'Cannot reach auth service' }, { status: 502 });
    }
}
