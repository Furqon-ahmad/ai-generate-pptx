export default async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured on server." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // Sanitize: only keep user/assistant roles (system not supported by many free models)
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(m => m && (m.role === "user" || m.role === "assistant"))
    .map(m => ({ role: m.role, content: String(m.content || "") }));

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No valid messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const payload = {
    model: body.model || "meta-llama/llama-3.3-70b-instruct:free",
    messages,
    temperature: body.temperature ?? 0.7,
    max_tokens: body.max_tokens ?? 2000,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-tools-hub.netlify.app",
        "X-Title": "AI Tools Hub"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.error || JSON.stringify(data);
      console.error("OpenRouter error:", response.status, errMsg);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: response.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("Fetch error:", err.message);
    return new Response(JSON.stringify({ error: "Failed to reach OpenRouter: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

export const config = {
  path: "/api/generate"
};
