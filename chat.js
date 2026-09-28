export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return res.status(500).json({
      error: "HF_TOKEN is not configured in Vercel Environment Variables."
    });
  }

  try {
    const body = req.body || {};
    const model = body.model || process.env.HF_MODEL || "Qwen/Qwen3.8-27B:novita";
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    const messages = [
      {
        role: "system",
        content:
          "You are Cure AI, a helpful, professional and friendly AI assistant. Give clear, useful answers."
      },
      ...incoming.slice(-20).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, 12000)
      }))
    ];

    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      })
    });

    const data = await hfResponse.json();

    if (!hfResponse.ok) {
      const message =
        data?.error?.message ||
        data?.error ||
        `Hugging Face returned HTTP ${hfResponse.status}`;
      return res.status(hfResponse.status).json({ error: String(message) });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) {
      return res.status(502).json({ error: "Hugging Face returned no assistant message." });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unexpected backend error."
    });
  }
}
