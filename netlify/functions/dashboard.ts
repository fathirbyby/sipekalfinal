import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'sipekal_secret_key_2024_fresh';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const getUserFromToken = (token?: string) => {
  if (!token) return null;
  try {
    return jwt.verify(token.replace('Bearer ', ''), JWT_SECRET) as any;
  } catch {
    return null;
  }
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const user = getUserFromToken(event.headers.authorization);
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    if (user.role === 'admin') {
      const [total, completed, process, pending, categories] = await Promise.all([
        sql`SELECT COUNT(*) FROM tickets`,
        sql`SELECT COUNT(*) FROM tickets WHERE status IN ('selesai_teknisi', 'tertutup')`,
        sql`SELECT COUNT(*) FROM tickets WHERE status IN ('ditugaskan', 'diproses')`,
        sql`SELECT COUNT(*) FROM tickets WHERE status = 'menunggu'`,
        sql`SELECT kategori, COUNT(*) as count FROM tickets GROUP BY kategori ORDER BY count DESC`
      ]);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count),
            pending: parseInt(pending[0].count)
          },
          categories
        })
      };
    } else if (user.role === 'teknisi') {
      const [total, completed, process, newTasks] = await Promise.all([
        sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id}`,
        sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status IN ('selesai_teknisi', 'tertutup')`,
        sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status = 'diproses'`,
        sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status = 'ditugaskan'`
      ]);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count),
            new: parseInt(newTasks[0].count)
          }
        })
      };
    } else {
      const [total, completed, process] = await Promise.all([
        sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id}`,
        sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id} AND status = 'tertutup'`,
        sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id} AND status IN ('ditugaskan', 'diproses', 'selesai_teknisi')`
      ]);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count)
          }
        })
      };
    }
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
