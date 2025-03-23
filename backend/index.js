import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { CompletionCopilot } from 'monacopilot';

const app = express();
app.use(cors(
    { origin: 'http://localhost:5173' }
));
app.use(express.json());

const copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
    provider: 'mistral',
    model: 'codestral',
});

app.post('/api/code-completion', async (req, res) => {
    const completion = await copilot.complete({ body: req.body });

    res.json(completion);
});

app.get('/', (req, res) => {
    res.send('Code Companion Server');
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
}
);