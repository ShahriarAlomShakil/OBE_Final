const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function testDatabase() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully\n');

    // Check if admin user exists
    const [users] = await connection.query(
      'SELECT id, name, email, username, password, role, is_active FROM users WHERE email = ?',
      ['admin@obe-system.local']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found in database');
      connection.release();
      process.exit(1);
    }

    const user = users[0];
    console.log('Admin user found:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- Role:', user.role);
    console.log('- Active:', user.is_active);
    console.log('- Password hash:', user.password.substring(0, 20) + '...\n');

    // Test passwords
    const testPasswords = ['password', 'Admin@123456', 'admin123', 'admin'];
    
    console.log('Testing passwords:');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`- "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testDatabase();
