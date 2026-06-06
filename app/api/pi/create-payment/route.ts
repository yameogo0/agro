// app/api/pi/create-payment/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, memo, metadata } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error('❌ PI_API_KEY non configurée');
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        memo,
        metadata: {
          ...metadata,
          source: 'agro-multicenter',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur API Pi:', data);
      return NextResponse.json(
        { error: data.error || 'Erreur lors du paiement' },
        { status: response.status }
      );
    }

    console.log('✅ Paiement créé:', data.identifier);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}