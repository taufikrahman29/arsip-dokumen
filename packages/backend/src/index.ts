import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🗂️  Arsip Digital API Server               ║
  ║──────────────────────────────────────────────║
  ║   Status  : Running                          ║
  ║   Port    : ${String(PORT).padEnd(33)}║
  ║   Mode    : ${env.NODE_ENV.padEnd(33)}║
  ║   API     : http://localhost:${PORT}/api       ║
  ║   Health  : http://localhost:${PORT}/api/health ║
  ╚══════════════════════════════════════════════╝
  `);
});
