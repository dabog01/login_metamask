import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String},
  blockchainAddress: { type: String, required: true, unique: true },
  nonce: { type: String, default: null },
  nonceCreatedAt: { type: Date, default: null }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;