const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/basedatostoken'; // Cambia la URI según tu configuración

const conectarDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error de conexión:', err);
    process.exit(1); // Detener la aplicación si no se puede conectar
  }
};

module.exports = conectarDB;
