import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_JLClkY1g8umb@ep-patient-grass-ajpo9ogw-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const JWT_SECRET = process.env.JWT_SECRET || 'sipekal_secret_key_2024_fresh';
const sql = neon(DATABASE_URL);

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
    if (event.httpMethod === 'GET') {
      let query;
      if (user.role === 'admin') {
        query = await sql`SELECT t.*, u.nama_lengkap as pelapor_nama, tech.nama_lengkap as teknisi_nama
          FROM tickets t
          LEFT JOIN users u ON t.pelapor_id = u.id
          LEFT JOIN users tech ON t.teknisi_id = tech.id
          ORDER BY t.created_at DESC`;
      } else if (user.role === 'teknisi') {
        query = await sql`SELECT t.*, u.nama_lengkap as pelapor_nama
          FROM tickets t
          LEFT JOIN users u ON t.pelapor_id = u.id
          WHERE t.teknisi_id = ${user.id}
          ORDER BY t.created_at DESC`;
      } else {
        query = await sql`SELECT t.*, tech.nama_lengkap as teknisi_nama
          FROM tickets t
          LEFT JOIN users tech ON t.teknisi_id = tech.id
          WHERE t.pelapor_id = ${user.id}
          ORDER BY t.created_at DESC`;
      }
      return { statusCode: 200, headers, body: JSON.stringify(query) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (body.action === 'create') {
        const ticketNumber = `TKT-${Date.now()}`;
        const result = await sql`
          INSERT INTO tickets (ticket_number, status, pelapor_id, judul, kategori, lokasi, prioritas, deskripsi, tgl_kejadian)
          VALUES (${ticketNumber}, 'menunggu', ${user.id}, ${body.judul}, ${body.kategori}, ${body.lokasi}, ${body.prioritas}, ${body.deskripsi}, ${body.tgl_kejadian})
          RETURNING *`;
        return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
      }

      if (body.action === 'assign') {
        if (user.role !== 'admin') return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        const result = await sql`UPDATE tickets SET teknisi_id = ${body.teknisi_id}, status = 'ditugaskan', updated_at = NOW()
          WHERE id = ${body.ticket_id} RETURNING *`;
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }

      if (body.action === 'accept') {
        if (user.role !== 'teknisi') return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        const result = await sql`UPDATE tickets SET status = 'diproses', updated_at = NOW()
          WHERE id = ${body.ticket_id} AND teknisi_id = ${user.id} RETURNING *`;
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }

      if (body.action === 'complete') {
        if (user.role !== 'teknisi') return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        const result = await sql`UPDATE tickets SET status = 'selesai_teknisi',
          catatan_perbaikan = ${body.catatan_perbaikan}, foto_selesai = ${body.foto_selesai},
          tgl_selesai = NOW(), updated_at = NOW()
          WHERE id = ${body.ticket_id} AND teknisi_id = ${user.id} RETURNING *`;
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }

      if (body.action === 'close') {
        if (user.role !== 'user') return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
        const result = await sql`UPDATE tickets SET status = 'tertutup', updated_at = NOW()
          WHERE id = ${body.ticket_id} AND pelapor_id = ${user.id} RETURNING *`;
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error: any) {
    console.error('[TICKETS] Error:', error?.message || error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
