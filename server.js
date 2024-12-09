const express = require('express');
const conectarDB = require('./config/db');
const preventaRoutes = require('./routes/preventaRoutes');
const app = express();
const port = 3000;

// Middleware para manejar el cuerpo de las solicitudes
app.use(express.json());

// Conectar a la base de datos
conectarDB();

// Usar las rutas definidas
app.use('/api/preventa', preventaRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
