const Fases = require('../models/basedatostoken');
const User = require('../models/user');
const transactions =require('../models/transactions')
const { param } = require('../routes/preventaRoutes');


async function disponiblesPorFase() {
  const faseActiva = true;
  try {
    const fases = await Fases.findOne({ faseActiva }) 
    return fases.tokensDisponibles; 
  } catch (error) {
    console.error('Error al obtener la fase activa:', error.message);
    throw error; 
  }
}


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
      const wallet=params.wallet
      const usuario = await User.findOne({ wallet });
      console.log("datos del comprador",usuario)//datos de quien esta haceindo la transsaccion
      if (usuario.referido.length>0)//si el usuario tuvo un referido cuando se registro 
        {
        const _id = usuario.referido//id del primer referido directo 5% comision usd
       const referido1 = await User.findOne({_id})
       console.log("referido de primer nivel",referido1)
       const valor5por=(precioTotal/100)*5
       //objeto con los datos de la wallet para el primer referido 5% de comision el dirtecto
       const objreferido5$={
        wallet:referido1.wallet,
        comision:valor5por
       }
       if(referido1.referido.length>0){
        const _id = referido1.referido//id del segundo referido directo 2% comision usd
        const referido2 = await User.findOne({_id})
        console.log("referido de primer nivel",referido2)
        const valor2por=(precioTotal/100)*2
        //objeto con los datos de la wallet para el primer referido 2% de comision el dirtecto
        const objreferido2$={
         wallet:referido2.wallet,
         comision:valor2por.toFixed(2)
        }
        if(referido2.referido.length>0){
          const _id = referido2.referido//id del tercer referido directo 2% comision usd
          const referido3 = await User.findOne({_id})
          console.log("referido de primer nivel",referido3)
          const valor3por=(precioTotal/100)*2
          //objeto con los datos de la wallet para el tercer referido 2% de comision el dirtecto
          const objreferido3$={
           wallet:referido3.wallet,
           comision:valor3por.toFixed(2)
          }
          if(referido3.referido.length>0){
            const _id = referido3.referido//id del tercer referido directo 1% comision usd
            const referido4 = await User.findOne({_id})
            console.log("referido de primer nivel",referido3)
            const valor4por=(precioTotal/100)*1
            //objeto con los datos de la wallet para el tercer referido 1% de comision el dirtecto
            const objreferido3$={
             wallet:referido4.wallet,
             comision:valor4por.toFixed(2)
            }
         }
       }
       }
      
      
      }
      if (fases.fase==1){
        usuario.tokensComprados=params.cantidadTokens+usuario.tokensComprados
        usuario.tokensporcomision=(params.cantidadTokens/100)*10+usuario.tokensporcomision
        await usuario.save();
      
      }
      if (fases.fase==2){
        usuario.tokensComprados=params.cantidadTokens+usuario.tokensComprados
        usuario.tokensporcomision=(params.cantidadTokens/100)*5+usuario.tokensporcomision
        await usuario.save();
       
      }
      if (fases.fase==3){
        usuario.tokensComprados=params.cantidadTokens+usuario.tokensComprados
        usuario.tokensporcomision=(params.cantidadTokens/100)*1+usuario.tokensporcomision
        await usuario.save();
        console.log("datooooooooooooos de comision en tokens",usuario.tokensComprados)
      }
      
      if (fases.tokensDisponibles === 0) {
        try {
          // Desactivar solo las fases con fase 1, 2 y 3
          await Fases.updateMany(
            { fase: { $in: [1, 2, 3] } }, 
            { $set: { faseActiva: false } }
          );
      
          const nuevaFaseActiva = fases.fase + 1;
          const MAX_FASE = 3; // Número máximo de fases
      
          if (nuevaFaseActiva <= MAX_FASE) {
            const faseActiva = await Fases.findOneAndUpdate(
              { fase: nuevaFaseActiva },
              { $set: { faseActiva: true } },
              { new: true }
            );
      
            if (!faseActiva) {
              console.warn("No se encontró la fase para activar:", nuevaFaseActiva);
            } else {
              console.log("Fase activada con éxito:", faseActiva);
            }
          } else {
            console.info("No hay más fases para activar. Todas las fases han terminado.");
          }
        } catch (error) {
          console.error("Error al actualizar las fases:", error);
        }
      } else {
        console.info("Aún hay tokens disponibles. No se realizan cambios en las fases.");
      }
      
      
    
      await fases.save();
      const fecha=new Date()
      await transactions.create({
        datos:{fases,usuario,fecha}
      })
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
  registro,
  disponiblesPorFase
};
