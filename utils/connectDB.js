import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Cache para la conexión de Mongoose
let cached = global.mongoose;

// Inicializa el caché si no existe
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Si ya hay una conexión, simplemente retorna
  if (cached.conn) {
    return cached.conn;
  }

  // Si no hay una promesa de conexión en curso, crea una nueva
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    };

    // Crea la promesa de conexión
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Espera a que la promesa se resuelva y guarda la conexión en caché
    cached.conn = await cached.promise;
  } catch (e) {
    // Si hay un error, reinicia la promesa en caché
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e; // Lanza el error para que pueda ser manejado en otro lugar
  }

  return cached.conn; // Retorna la conexión
}

export default connectDB;