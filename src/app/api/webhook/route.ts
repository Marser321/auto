import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route proxy para webhooks de n8n.
 * La URL real del webhook NUNCA se expone al cliente.
 * Solo se usa la variable de entorno server-side N8N_WEBHOOK_URL.
 */
export async function POST(request: NextRequest) {
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('[Webhook] N8N_WEBHOOK_URL no está configurada');
            return NextResponse.json(
                { error: 'Servicio de integración no disponible' },
                { status: 503 }
            );
        }

        const body = await request.json();

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('[Webhook] Error de n8n:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Error al procesar la solicitud' },
                { status: 502 }
            );
        }

        const data = await response.json().catch(() => ({}));

        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Webhook] Error interno:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
