const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  await mongoose.connect('mongodb://localhost:27017/school-erp');
  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.collection('users').updateOne(
    { role: 'SUPER_ADMIN' },
    { $set: { password: hashedPassword } }
  );
  console.log('Password reset successfully to admin123');
  process.exit(0);
}

resetPassword().catch(console.error);
