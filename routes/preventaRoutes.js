const express = require('express');
const { comprarTokens, actualizarFase,costotoken,registro,disponiblesPorFase } = require('../controllers/preventacontroller');
const router = express.Router();


router.post('/registro', async (req, res) => {
  const params = req.body;
  try {
    const Registro = await registro(params);
    res.json({ mensaje:Registro });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Ruta para comprar tokens
router.post('/comprarTokens', async (req, res) => {
  const {  cantidadTokens } = req.body;
  console.log(req.body)
  try {
    const costo = await comprarTokens(req.body);
    res.json({ mensaje: "true" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/disponiblesPorFase', async (req, res) => {
  try {
    const cantidadDisponible = await disponiblesPorFase();
    res.status(200).json({
      mensaje: "Éxito",
      cantidadDisponible,
    });
  } catch (error) {
    console.error("Error en disponiblesPorFase:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener los datos",
      error: error.message,
    });
  }
});


//ruta costo del token actual
router.get('/costotoken', async (req, res) => {
    const cantidadTokens = parseInt(req.query.cantidadTokens, 10);
  
    // Validar si el parámetro es un número válido
    if (isNaN(cantidadTokens) || cantidadTokens <= 0) {
      return res.status(400).json({ error: 'La cantidad de tokens debe ser un número mayor a 0' });
    }
  
    try {
      const valores = await costotoken(cantidadTokens);
      res.json({ mensaje: 'Éxito', valores });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Ruta para actualizar la fase de la preventa
router.post('/actualizarFase', async (req, res) => {
  try {
    await actualizarFase();
    res.json({ mensaje: 'Fase actualizada correctamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
