// app/api/pi/complete-payment/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId, transactionId } = await request.json();

    // Validation
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de paiement requis' },
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

    // Appel à l'API Pi pour compléter le paiement
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txid: transactionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur completion paiement:', data);
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la confirmation du paiement' },
        { status: response.status }
      );
    }

    console.log('✅ Paiement complété:', paymentId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}