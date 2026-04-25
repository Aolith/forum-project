const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  sno: String,
  password: String,
  name: String
});
const User = mongoose.model('User', UserSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('数据库已连接');

  const oldUsers = [
    { sno: '6020240921', password: 'huhanyu62', name: '胡涵钰' },
    { sno: '6020240950', password: 'congjiu55', name: '冯语涵' }
  ];

  for (const u of oldUsers) {
    const exists = await User.findOne({ sno: u.sno });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({ sno: u.sno, password: hashedPassword, name: u.name });
      console.log(`✅ 已迁移用户: ${u.sno} ${u.name}`);
    } else {
      console.log(`⏭️ 用户已存在，跳过: ${u.sno}`);
    }
  }

  console.log('迁移完成');
  await mongoose.disconnect();
}

migrate().catch(err => console.error('迁移失败:', err));