const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema); // 👈 Must match the ref in Entry model
