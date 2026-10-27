import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import {join} from 'node:path';
import { GoogleGenAI } from '@google/genai';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

/**
 * BSU AI Study Assistant API endpoint using @google/genai
 */
app.post('/api/ai-study', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, context } = req.body as { prompt: string; context: string };
    const apiKey = process.env['GEMINI_API_KEY'];
    
    if (!apiKey) {
      res.json({
        answer: `[BSU AI Tutor Note: GEMINI_API_KEY is not configured on the server. Here is a simulated response]: As your Benue State University academic companion regarding "${prompt}", remember to consult your departmental handbook and course lecturers for authoritative guidance in Scientia Liberatio Populorum!`
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are the official Benue State University (BSU) AI Study Companion. Context: ${context || 'General BSU Student Inquiry'}. User prompt: ${prompt}` }
          ]
        }
      ]
    });

    res.json({ answer: response.text || 'No response generated.' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
    console.error('AI Study API Error:', err);
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: unknown) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
