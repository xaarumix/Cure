export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "HF_TOKEN is not configured in Vercel."
    });
  }

  try {
    const body = req.body || {};
    const model =
      body.model ||
      process.env.HF_MODEL ||
      "Qwen/Qwen3.8-27B:novita";

    const incoming = Array.isArray(body.messages)
      ? body.messages
      : [];

    const messages = [
      {
        role: "system",
        content:
          "You are Cure AI, a helpful, professional and friendly AI assistant. Give clear and useful answers."
      },
      ...incoming.slice(-20)
    ];

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.error || "Hugging Face error"
      });
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "No AI response returned."
      });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Backend error"
    });
  }
}
