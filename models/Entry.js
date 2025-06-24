const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User', // 👈 Must match the model name
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Entry', entrySchema);
