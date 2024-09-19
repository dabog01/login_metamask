import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

const secretKey = process.env.secretKey;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { signedMessage, nonce, address } = req.body;

    console.log('Received login request for address:', address);

    if (!signedMessage || !nonce || !address) {
      console.log('Missing required fields:', { signedMessage, nonce, address });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ blockchainAddress: address });
    if (!user) {
      console.log('User not found for address:', address);
      return res.status(400).json({ error: 'User not found' });
    }

    console.log('User found:', user);

    if (!user.nonce || !user.nonceCreatedAt) {
      console.log('Nonce not found for user:', user);
      return res.status(400).json({ error: 'Nonce not found' });
    }

    const nonceAge = (new Date() - user.nonceCreatedAt) / 1000 / 60;
    if (nonceAge > 5) {
      console.log('Nonce has expired. Age:', nonceAge);
      return res.status(400).json({ error: 'Nonce has expired' });
    }

    if (user.nonce !== nonce) {
      console.log('Invalid nonce. Expected:', user.nonce, 'Received:', nonce);
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    console.log('Verifying message signature...');
    const recoveredAddress = ethers.verifyMessage(nonce, signedMessage);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      console.log('Invalid signature. Recovered:', recoveredAddress, 'Expected:', address);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('Signature verified. Generating token...');
    const token = jwt.sign({ userId: user._id, address }, secretKey, { expiresIn: '1h' });

    user.nonce = null;
    user.nonceCreatedAt = null;
    await user.save();

    console.log('Login successful for address:', address);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
}