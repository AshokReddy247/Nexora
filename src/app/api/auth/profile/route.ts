import { NextRequest, NextResponse } from 'next/server';

const DJANGO_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const res = await fetch(`${DJANGO_URL}/api/auth/profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: 'Cannot reach auth service' }, { status: 502 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization') || '';
        const body = await request.json();
        const res = await fetch(`${DJANGO_URL}/api/auth/profile/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: 'Cannot reach auth service' }, { status: 502 });
    }
}
