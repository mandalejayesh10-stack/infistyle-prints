import { handle } from 'hono/aws-lambda';
import app from './app';

// Local development server configuration
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT) {
  import('@hono/node-server').then(({ serve }) => {
    const port = 3000;
    console.log(`🚀 Local Hono API server starting on http://localhost:${port}`);
    serve({
      fetch: app.fetch,
      port
    });
  });
}

export const handler = handle(app);
