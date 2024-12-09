const Preventa = require('../models/basedatostoken');
const User = require('../models/user')


async function registro(params) {
  try{
    console.log("datooooooooooos",params.num_id)
    let num_id = params.num_id
   
    const existe = await User.findOne({ num_id});
    if(existe==null){
      const datos=await User.create({
        nombres_completos:params.nombres_completos,
        descripcion:"nomaluser",
        wallet:params.wallet,
        num_id:num_id
      })
    }
  }catch (error) {
    console.error('Error al registrar user:', error.message);
  }
}


async function costotoken(cantidadTokens) {
    try{
        if (cantidadTokens <= 0) {
            throw new Error('La cantidad de tokens debe ser mayor a 0');
          }else 
          {
            const faseActiva=true;
            const preventa = await Preventa.findOne({ faseActiva });
            const cantidadTotalObjetos = preventa.cantidadTotal;
            const precioInicial = parseFloat(preventa.precioini);
            const precioFinal = parseFloat(preventa.preciofin);
            const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
            let precioTotal = 0;
            if(cantidadTokens<=preventa.tokensDisponibles){
              for (let i = 0; i < cantidadTokens; i++) {
       
                const unidadesVendidas = preventa.tokensVendidos + i;
              
                const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
                precioTotal += precioUnitario;
              }
              return precioTotal
            }else{
              return "esa cantidad de tokens supera la disponible para la fase actual"
            }
          
          }


    }  catch(error){
        console.error('Error al comprar tokens:', error.message);
    }
    
}

async function comprarTokens( comision,user,cantidadTokens) {
    try {


      // Validar que cantidadTokens sea positivo
      if (cantidadTokens <= 0) {
        throw new Error('La cantidad de tokens debe ser mayor a 0');
      }
  const faseActiva=true;
      // Obtener la fase de la preventa desde la base de datos
      const preventa = await Preventa.findOne({ faseActiva });
  
     
      if ( preventa.tokensDisponibles  < cantidadTokens) {
        throw new Error('No hay suficientes tokens disponibles en esta fase');
      }
      // Variables necesarias para el cálculo del precio
      const cantidadTotalObjetos = preventa.cantidadTotal;
      const precioInicial = parseFloat(preventa.precioini);
      const precioFinal = parseFloat(preventa.preciofin);
      const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;

      console.log("preventa1 ",  cantidadTokens )
      // Calcular el precio total de los tokens a comprar
      let precioTotal = 0;
      for (let i = 0; i < cantidadTokens; i++) {
       
        const unidadesVendidas = preventa.tokensVendidos + i;
      
        const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
        precioTotal += precioUnitario;
      }
      console.log("preventa ",  cantidadTokens )
      // Actualizar los valores en la base de datos
      preventa.tokensVendidos = preventa.tokensVendidos+cantidadTokens;
      preventa.precioactual = precioInicial + aumentoPorUnidad * preventa.tokensVendidos; 
      preventa.tokensDisponibles=preventa.tokensDisponibles-cantidadTokens

      await preventa.save();
  
      console.log(`Compra exitosa. Tokens vendidos en esta fase: ${preventa.tokensVendidos}`);
      console.log(`Total pagado por los tokens: ${precioTotal.toFixed(2)}`);
  
    } catch (error) {
      console.error('Error al comprar tokens:', error.message);
    }
  }
  

async function actualizarFase() {
  const faseActiva = await Preventa.findOne({ faseActiva: true });
  
  if (faseActiva) {
    // Desactivar la fase activa actual
    faseActiva.faseActiva = false;
    await faseActiva.save();
    
    // Activar la siguiente fase
    const siguienteFase = await Preventa.findOne({ fase: faseActiva.fase + 1 });
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
