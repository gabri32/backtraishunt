const Fases = require('../models/basedatostoken');
const User = require('../models/user');
const { param } = require('../routes/preventaRoutes');

//function que permite regitrar o logear al usuario 
async function registro(params) {
  try {
    let wallet = params.wallet;

    const existe = await User.findOne({ wallet });
    if (existe == null) {
      const datos = await User.create({
        nombres_completos: params.nombres_completos,
        descripcion: "nomaluser",
        wallet: params.wallet,
        num_id: params.num_id, 
        referido: params.referido
      });
      return datos; // Retornar el objeto recién creado si no existía
    } else {
      return existe; // Retornar el objeto existente
    }
  } catch (error) {
    console.error('Error al registrar user:', error.message);
    throw error; 
  }
}

//calcular valor del token actual
async function costotoken(cantidadTokens) {
    try{
        if (cantidadTokens <= 0) {
            throw new Error('La cantidad de tokens debe ser mayor a 0');
          }else 
          {
            const faseActiva=true;
            const fases = await Fases.findOne({ faseActiva });
            const cantidadTotalObjetos = fases.cantidadTotal;
            const precioInicial = parseFloat(fases.precioini);
            const precioFinal = parseFloat(fases.preciofin);
            const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
            let precioTotal = 0;
            if(cantidadTokens<=fases.tokensDisponibles){
              for (let i = 0; i < cantidadTokens; i++) {
       
                const unidadesVendidas = fases.tokensVendidos + i;
              
                const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
                precioTotal += precioUnitario;
              }
              const total={
                precioTotal,cantidadTokens
              }
              return total
            }else{
              return "esa cantidad de tokens supera la disponible para la fase actual"
            }
          
          }


    }  catch(error){
        console.error('Error al comprar tokens:', error.message);
    }
    
}

async function comprarTokens( params) {
    try {

console.log(params)
      // Validar que cantidadTokens sea positivo
      if (params.cantidadTokens <= 0) {
        throw new Error('La cantidad de tokens debe ser mayor a 0');
      }
  const faseActiva=true;
      // Obtener la fase de la Fases desde la base de datos
      const fases = await Fases.findOne({ faseActiva });
      if ( fases.tokensDisponibles  < params.cantidadTokens) {
        throw new Error('No hay suficientes tokens disponibles en esta fase');
      }
      // Variables necesarias para el cálculo del precio
      const cantidadTotalObjetos = fases.cantidadTotal;
      const precioInicial = parseFloat(fases.precioini);
      const precioFinal = parseFloat(fases.preciofin);
      const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
      // Calcular el precio total de los tokens a comprar
      let precioTotal = 0;
      for (let i = 0; i < params.cantidadTokens; i++) {
        const unidadesVendidas = fases.tokensVendidos + i;
        const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
        precioTotal += precioUnitario;
      }
      // Actualizar los valores en la base de datos
      fases.tokensVendidos = fases.tokensVendidos+params.cantidadTokens;
      fases.precioactual = precioInicial + aumentoPorUnidad * fases.tokensVendidos; 
      fases.tokensDisponibles=fases.tokensDisponibles-params.cantidadTokens

      await fases.save();
      if (fases.tokensDisponibles == 0) {
        try {
         
          await Fases.updateMany({}, { $set: { faseActiva: false } });
      
         
          const nuevaFaseActiva = fases.fase + 1; 
          const faseActiva = await Fases.findOneAndUpdate(
            { fase: nuevaFaseActiva }, 
            { $set: { faseActiva: true } }, 
            { new: true } 
          );
      
          if (!faseActiva) {
            console.log("No se encontró la fase para activar.");
          } else {
            console.log("Fase activada con éxito:", faseActiva);
          }
        } catch (error) {
          console.error("Error al actualizar las fases:", error.message);
        }
      }
      
      console.log(`Compra exitosa. Tokens vendidos en esta fase: ${fases.tokensVendidos}`);
      console.log(`Total pagado por los tokens: ${precioTotal.toFixed(2)}`);
  
    } catch (error) {
      console.error('Error al comprar tokens:', error.message);
    }
  }
  

async function actualizarFase() {
  const faseActiva = await Fases.findOne({ faseActiva: true });
  
  if (faseActiva) {
    // Desactivar la fase activa actual
    faseActiva.faseActiva = false;
    await faseActiva.save();
    
    // Activar la siguiente fase
    const siguienteFase = await Fases.findOne({ fase: faseActiva.fase + 1 });
    if (siguienteFase) {
      siguienteFase.faseActiva = true;
      await siguienteFase.save();
    }
  }
}

module.exports = {
  comprarTokens,
  actualizarFase,
  costotoken,
  registro
};
