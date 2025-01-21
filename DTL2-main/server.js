const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBm1Dn8ZnXS4Rq9gHGAxOqob6W1bQtmLJU"; // API Key directly here

const genAI = new GoogleGenerativeAI(apiKey);
const app = express();

app.use(cors());
app.use(express.json());

// Generative AI model configuration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "You are a helpful assistant.", // Customize as needed
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const chatSession = model.startChat({
      generationConfig,
      history,
    });

    const result = await chatSession.sendMessage(message);

    res.json({
      response: result.response.text(),
    });
  } catch (error) {
    console.error("Error in /chat route:", error);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
