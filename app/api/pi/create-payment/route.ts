import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, memo, metadata } = await request.json();
    const apiKey = process.env.PI_API_KEY;

    const response = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        memo,
        metadata,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}