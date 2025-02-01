const express = require('express');
const { comprarTokens, actualizarFase,costotoken,registro,disponiblesPorFase,verifyref } = require('../controllers/preventacontroller');
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
  console.log(req.body.params)
  try {
    const costo = await comprarTokens(req.body.params);
    console.log("datooooooooooooooooooos",costo)
    res.json({ mensaje: "true", costo });

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

router.get('/verifyref', async (req, res) => {
  const ref = req.query.ref;
  try {
    const refExiste = await verifyref(ref);
    if (refExiste.success) {
      res.json({ mensaje: 'Usuario encontrado', user: refExiste.user }); // Si el usuario existe
    } else {
      res.status(404).json({ mensaje: refExiste.message }); // Si el usuario no existe
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      console.log(valores)
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
