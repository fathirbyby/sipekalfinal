import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
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

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email: rawEmail, password: rawPassword } = JSON.parse(event.body || '{}');
    const email = (rawEmail || '').trim().toLowerCase();
    const password = String(rawPassword || '').trim();

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email dan password wajib diisi' }) };
    }

    console.log(`[AUTH] Login attempt: ${email}`);

    const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

    if (users.length === 0) {
      console.log(`[AUTH] User not found: ${email}`);
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Email atau password salah' }) };
    }

    const user = users[0];
    console.log(`[AUTH] Found user: ${user.email}, role: ${user.role}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[AUTH] Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Email atau password salah' }) };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama_lengkap: user.nama_lengkap },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH] Login success: ${email} (${user.role})`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: { id: user.id, email: user.email, role: user.role, nama_lengkap: user.nama_lengkap }
      })
    };
  } catch (error: any) {
    console.error('[AUTH] Fatal error:', error?.message || error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', detail: error?.message })
    };
  }
};
