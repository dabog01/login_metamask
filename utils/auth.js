import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

const secretKey = process.env.secretKey;

// Función para validar el inicio de sesión
export const validateLogin = async (signedMessage, nonce, address) => {
    await connectDB();

    // Validación de campos requeridos
    if (!signedMessage || !nonce || !address) {
        throw new Error('Faltan campos requeridos');
    }

    let user = await User.findOne({ blockchainAddress: address });

    // Crear nuevo usuario si no existe
    if (!user) {
        user = new User({
            blockchainAddress: address,
            nonce: null,
            nonceCreatedAt: null,
            email: `${address}@domain.com`, // Valor predeterminado para email
            name: 'Usuario Desconocido', // Valor predeterminado para nombre
        });
        await user.save(); // Guardar nuevo usuario
    }

    // Verificar existencia y validez del nonce
    if (!user.nonce || !user.nonceCreatedAt) {
        throw new Error('Nonce no encontrado');
    }

    const nonceAge = (new Date() - user.nonceCreatedAt) / 1000 / 60;
    if (nonceAge > 5) {
        throw new Error('El nonce ha expirado');
    }

    if (user.nonce !== nonce) {
        throw new Error('Nonce inválido');
    }

    // Verificar firma del mensaje
    const recoveredAddress = ethers.verifyMessage(nonce, signedMessage);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Firma inválida');
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id, address }, secretKey, { expiresIn: '30s' });

    // Limpiar el nonce después del inicio de sesión exitoso
    user.nonce = null;
    user.nonceCreatedAt = null;
    await user.save();

    return token; // Retornar el token generado
};

// Función para verificar el token JWT
export const verifyToken = (token) => {
    if (!token) {
        throw new Error('Token inválido');
    }

    const decoded = jwt.verify(token, secretKey);

    if (!decoded.userId || !decoded.address) {
        throw new Error('Token inválido');
    }

    return decoded; // Retornar el contenido del token decodificado
};