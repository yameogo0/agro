import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API fonctionnelle !' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body }, { status: 201 });
}