import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================
// API Routes
// ============================================================

app.get('/api/students', async (_req: Request, res: Response) => {
  const { students } = await import('./src/data/mockData.js');
  res.json({ data: students, total: students.length });
});

app.get('/api/staff', async (_req: Request, res: Response) => {
  const { staff } = await import('./src/data/mockData.js');
  res.json({ data: staff, total: staff.length });
});

app.post('/api/ai-chat', async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Mock Gemini response for now
  const mockResponse = `I am the Ashram Shala AI Assistant. You asked: "${message}". 
This is a mock response. When the GEMINI_API_KEY is configured, I will provide 
intelligent responses about student data, attendance, hostel management, and more.`;

  res.json({ response: mockResponse });
});

// ============================================================
// Vite Dev Server or Static Serving
// ============================================================

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
});
