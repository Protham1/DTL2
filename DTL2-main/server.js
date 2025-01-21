const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

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

// Update Timeline Endpoint
app.post("/update-timeline", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: "Topic is required" });
  }

  try {
    // Define instructions for the AI model
    const instructions = `
    You are a helpful assistant providing scientific context.
    Provide dates in a concise way,explain each content in 150-300 words
    When a topic is provided, modify only the contents of this html page according to the major discoverier and build a timeline for the provided topic
    give as many events as possibel try to give at least 10 events
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TimeLine</title>
      <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <center>
    <header>
        <h1>Timeline of Thermodynamics</h1>
        <p>Explore key discoveries and events in the field of thermodynamics.</p>
    </header>
    </center>
    <div class="timeline">
        <div class="container" id="main">

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-right">
                    <h2><a href="carnot.html">Carnot's Principle</a></h2>
                    <div class="date">1824</div>
                    <p>Sadi Carnot publishes "Reflections on the Motive Power of Fire," introducing the Carnot cycle and laying the foundation for the second law of thermodynamics.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-right">
                    <h2><a href="joule.html">Joule's Mechanical Equivalent of Heat</a></h2>
                    <div class="date">1843</div>
                    <p>James Prescott Joule demonstrates the mechanical equivalent of heat, establishing the principle of energy conservation and connecting heat to work.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-right">
                    <h2><a href="kelvin.html">Kelvin's Absolute Temperature Scale</a></h2>
                    <div class="date">1848</div>
                    <p>Lord Kelvin proposes the absolute temperature scale, which is independent of the properties of any specific substance, forming a basis for thermodynamic studies.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-left">
                    <h2><a href="clausius.html">Clausius and Entropy</a></h2>
                    <div class="date">1850</div>
                    <p>Rudolf Clausius formulates the second law of thermodynamics and introduces the concept of entropy, describing the directionality of energy transformations.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-right">
                    <h2><a href="maxwell.html">Maxwell's Relations</a></h2>
                    <div class="date">1871</div>
                    <p>James Clerk Maxwell develops thermodynamic relations, linking different partial derivatives of thermodynamic potentials and aiding in the study of systems at equilibrium.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
                <div class="timeline-content"  data-aos="fade-up-left">
                    <h2><a href="gibbs.html">Gibbs Free Energy</a></h2>
                    <div class="date">1873</div>
                    <p>Josiah Willard Gibbs introduces the concept of free energy, providing a criterion for spontaneity and equilibrium in chemical and physical processes.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
              <div class="timeline-content"  data-aos="fade-up-right">
                    <h2><a href="boltzman.html">Boltzmann's Statistical Mechanics</a></h2>
                    <div class="date">1877</div>
                    <p>Ludwig Boltzmann develops statistical mechanics, connecting macroscopic thermodynamic properties to microscopic molecular behavior and probabilities.</p>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-circle" data-aos="zoom-in" ></div>
                <div class="timeline-content"  data-aos="fade-up-left">
                    <h2><a href="thirdlaw.html">Third Law of Thermodynamics</a></h2>
                    <div class="date">1906</div>
                    <p>Walther Nernst formulates the third law of thermodynamics, stating that as a system approaches absolute zero, the entropy of the system approaches a constant minimum.</p>
                </div>
            </div>

            <script src="./js/aos.js"></script>
<script src="./js/main.js"></script>

</body>

</html>

    `;
    

    // Combine instructions with the provided topic
    const inputMessage = `${instructions}\nTopic: ${topic}`;

    // Start a new chat session with the AI model
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the combined message (instructions + topic) to the AI model
    const result = await chatSession.sendMessage(inputMessage);

    // Extract the response from the AI model
    const aiResponse = result.response.text();

    // Log the AI response for debugging
    // console.log("AI Response:", aiResponse);

    // Construct the full path to timeline.html
    const filePath = path.join(__dirname, "timeline.html");

    fs.writeFile(filePath, `<h2>${topic}</h2><p>${aiResponse}</p>\n`, (err) => {
      if (err) {
        console.error("Error writing to timeline.html:", err);
        return res.status(500).json({ message: "Failed to write response to file" });
      }
    
      console.log(`AI response successfully written to ${filePath}`);
      console.log(`Query: ${topic}`);
      res.json({
        message: "Timeline updated successfully",
      });
    });
  } catch (error) {
    console.error("Error in /update-timeline route:", error);
    res.status(500).json({ message: "Failed to update timeline" });
  }
});

// Chat endpoint (unchanged)
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
