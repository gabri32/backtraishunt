const express = require('express');
const conectarDB = require('./config/db');
const preventaRoutes = require('./routes/preventaRoutes');
const app = express();
const port = 3000;
const cors = require('cors');



const allowedOrigins = ['http://localhost:3000'];

// app.use(cors({
//   origin: function (origin, callback) {
//     console.log("datos del origin",origin)
//     if (origin && allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('No autorizado por CORS'));
//     }
//   }
// }));

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
