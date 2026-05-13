import mysql from 'mysql2/promise'
import { hashPassword } from '../server/utils/auth'

async function seedDemoUser() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'app',
    password: process.env.MYSQL_PASSWORD || 'secret',
    database: process.env.MYSQL_DATABASE || 'tasksdb'
  }

  const connection = await mysql.createConnection(config)

  try {
    // Check if demo user exists
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', ['demo@example.com'])
    if (Array.isArray(rows) && rows.length > 0) {
      console.log('Demo user already exists')
      return
    }

    // Create demo user
    const passwordHash = hashPassword('password')
    await connection.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['demo@example.com', passwordHash])

    console.log('Demo user seeded: demo@example.com / password')
  } finally {
    await connection.end()
  }
}

seedDemoUser().catch(console.error)