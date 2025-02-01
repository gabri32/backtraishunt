const mongoose = require('mongoose');
require('dotenv').config();
let mongo=process.env.MONGODB_URI
const mongoURI = mongo
; // Cambia la URI según tu configuración

const conectarDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error de conexión:', err);
    process.exit(1); 
  }
};

module.exports = conectarDB;
