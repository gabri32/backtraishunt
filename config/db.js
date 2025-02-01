const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://traishunt2020:6AB4FcawnKbyd8wS@cluster0.y2t97.mongodb.net/basedatostoken?retryWrites=true&w=majority&appName=Cluster0'
; // Cambia la URI según tu configuración

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
