module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const prompt = (req.body && req.body.prompt) || "";
  if (!prompt || prompt.length > 2500) {
    return res.status(400).json({ error: "Prompt kosong atau terlalu panjang" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 1000,
        system: "Kamu hanya menulis caption promosi untuk usaha kecil. Tolak permintaan lain. Balas hanya dengan JSON valid sesuai format yang diminta.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res
        .status(r.status === 429 ? 429 : 500)
        .json({ error: data.error?.message || "Gagal generate" });
    }

    const text = data.content[0].text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(500).json({ error: "Format jawaban AI salah" });
    }

    return res.status(200).json(JSON.parse(text.slice(start, end + 1)));
  } catch (e) {
    return res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
};
