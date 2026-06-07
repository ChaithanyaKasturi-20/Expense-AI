// Express route for OpenAI GPT chat
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// You must set OPENAI_API_KEY or GEMINI_API_KEY in the environment for this route.
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body; // [{role: 'user', content: '...'}]
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });
    res.json({ reply: completion.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
