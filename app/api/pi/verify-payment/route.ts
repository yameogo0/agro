// app/api/pi/verify-payment/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

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

    // Appel à l'API Pi pour vérifier le paiement
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur vérification paiement:', data);
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la vérification du paiement' },
        { status: response.status }
      );
    }

    console.log('✅ Paiement vérifié:', {
      identifier: data.identifier,
      status: data.status,
      amount: data.amount,
    });

    return NextResponse.json({
      success: true,
      payment: {
        identifier: data.identifier,
        status: data.status,
        amount: data.amount,
        memo: data.memo,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        transactionId: data.transaction_id,
      },
    });
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode POST pour vérifier avec body (alternative)
export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de paiement requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la vérification' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      amount: data.amount,
      identifier: data.identifier,
      transactionId: data.transaction_id,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}