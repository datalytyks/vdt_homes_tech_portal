import postgres from 'postgres'

// Uses Supabase transaction-mode pooler (port 6543).
// prepare: false is required for transaction-mode pooling.
const sql = postgres(process.env.DATABASE_URL!, {
  ssl:     'require',
  prepare: false,
  max:     1, // serverless: keep connection count low
})

export default sql
