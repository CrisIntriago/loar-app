const JELOU_CALLBACK_URL = 'https://workflows.jelou.ai/v1/webview/callback';

interface JelouCallbackPayload {
    executionId: string;
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
}

interface JelouCallbackResponse {
    ok: boolean;
    status: number;
    body: unknown;
}

export async function jelouCallback(payload: JelouCallbackPayload): Promise<JelouCallbackResponse> {
    const res = await fetch(JELOU_CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    return {
        ok: res.ok,
        status: res.status,
        body,
    };
}
