module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic } = req.body || {};
  if (!topic) return res.status(400).json({ error: "topic kosong" });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 300,
      messages: [
        { role: "user", content: `Buatkan 3 caption Instagram singkat dalam bahasa Indonesia untuk: ${topic}` },
      ],
    }),
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: data.error?.message || "Gagal generate" });
  res.status(200).json({ caption: data.content[0].text });
};
