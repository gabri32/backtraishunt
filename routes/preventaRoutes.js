const express = require('express');
const { comprarTokens, actualizarFase,costotoken,registro } = require('../controllers/preventacontroller');
const router = express.Router();


router.post('/registro', async (req, res) => {
  const params = req.body;
  try {
    const Registro = await registro(params);
    res.json({ mensaje: `registro exitoso.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Ruta para comprar tokens
router.post('/comprarTokens', async (req, res) => {
  const {  cantidadTokens } = req.body;
  try {
    const costo = await comprarTokens(cantidadTokens);
    res.json({ mensaje: `Compra exitosa.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get('/costotoken', async (req, res) => {
    const cantidadTokens = parseInt(req.query.cantidadTokens, 10);
  
    // Validar si el parámetro es un número válido
    if (isNaN(cantidadTokens) || cantidadTokens <= 0) {
      return res.status(400).json({ error: 'La cantidad de tokens debe ser un número mayor a 0' });
    }
  
    try {
      const costo = await costotoken(cantidadTokens);
      res.json({ mensaje: 'Éxito', costo });
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
