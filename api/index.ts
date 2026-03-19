import app from "../packages/backend/dist/index.js"

// Vercel Serverless Function entrypoint.
// All /api/* requests are rewritten to this function in vercel.json.
export default app

