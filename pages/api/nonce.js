import crypto from 'crypto';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { address } = req.body;
    const stringAddress = address.toString();

    let user = await User.findOne({ blockchainAddress: stringAddress });
    if (!user) {
      return res.status(400).json({ message: 'Please register first' });
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    user.nonce = nonce;
    user.nonceCreatedAt = new Date();
    await user.save();

    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error in /api/nonce:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
}