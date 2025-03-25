import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { CompletionCopilot } from 'monacopilot';

const API_KEY = process.env.MISTRAL_API_KEY

const app = express();
app.use(cors(
    { origin: 'https://ai-autocomplete-suggestion.onrender.com' }
));
app.use(express.json());

const copilot = new CompletionCopilot(API_KEY, {
    provider: 'mistral',
    model: 'codestral',
});

app.post('/api/code-completion', async (req, res) => {
    try {
        const completion = await copilot.complete({ body: req.body });
        res.json(completion);
    } catch (error) {
        console.error("Error during code completion:", error);
        res.status(500).json({ error: "Failed to complete code. Please check your API key and configuration." });
    }
});


app.get('/', (req, res) => {
    res.send('Code Companion Server');
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
}
); 