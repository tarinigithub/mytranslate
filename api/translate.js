export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, lang } = req.body;
  const token = process.env.HF_TOKEN;

  const MODEL_MAP = {
    es: "Helsinki-NLP/opus-mt-en-es",
    fr: "Helsinki-NLP/opus-mt-en-fr",
    de: "Helsinki-NLP/opus-mt-en-de",
    // add more target languages here if you like
  };

  const model = MODEL_MAP[lang];
  if (!model) {
    return res.status(400).json({ error: "Unsupported language: " + lang });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const data = await response.json();
    // Expect data like: [{ translation_text: "..." }]
    const translation = (data && data[0] && data[0].translation_text) || "No translation";

    res.status(200).json({ translation });
  } catch (err) {
    console.error("Error in translation handler:", err);
    res.status(500).json({ error: "Translation failed" });
  }
}
