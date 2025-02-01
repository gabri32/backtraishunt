const Fases = require('../models/basedatostoken');
const User = require('../models/user');
const transactions = require('../models/transactions')
const { param } = require('../routes/preventaRoutes');
//const { checkBalance } = require('../routes/ldab');


async function disponiblesPorFase() {
  const faseActiva = true;
  try {
    const fases = await Fases.findOne({ faseActiva })
    return fases;
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
        descripcion: "nomaluser",
        wallet: params.wallet,
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
            const total = cantidadTokens === 0 
            ? { precioTotal: 0, cantidadTokens: 0 } 
            : { precioTotal, cantidadTokens };
          
          return total;
          
          }else{
            return "esa cantidad de tokens supera la disponible para la fase actual"
          }
        
        


  }  catch(error){
      console.error('Error al comprar tokens:', error.message);
  }
  
}
  
async function verifyref(_id) {
  try {
    const user = await User.findOne({ _id: _id });
    if (user) {
      return { success: true, user }; // Devuelve el usuario con éxito
    } else {
      return { success: false, message: "No existe usuario con ese id" }; // Mensaje claro en caso de error
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: 'Error al buscar usuario' }; // Mensaje de error si algo sale mal
  }
}

async function comprarTokens(params) {
  try {
    console.log("datos de la compra", params)
    const e = 10 ** 6;
    const wallettocontrato = [];
    
    if (params.cantidadTokens <= 0) {
      throw new Error('La cantidad de tokens debe ser mayor a 0');
    }
    
    const faseActiva = true;
    const fases = await Fases.findOne({ faseActiva });
    if (fases.tokensDisponibles < params.cantidadTokens) {
      throw new Error('No hay suficientes tokens disponibles en esta fase');
    }
    
    const cantidadTotalObjetos = fases.cantidadTotal;
    const precioInicial = parseFloat(fases.precioini);
    const precioFinal = parseFloat(fases.preciofin);
    const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
    let precioTotal = 0;
    
    const unidadesVendidas = fases.tokensVendidos;
    const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
    precioTotal = precioUnitario * params.cantidadTokens;
    
    fases.tokensVendidos += params.cantidadTokens;
    fases.precioactual = precioInicial + aumentoPorUnidad * fases.tokensVendidos;
    fases.tokensDisponibles -= params.cantidadTokens;
    
    const wallet = params.wallet;
    const usuario = await User.findOne({ wallet });
    console.log("datos del comprador", usuario);
    
    const comprador = {
      wallet: usuario.wallet,
      amount: precioTotal.toFixed(6) * e,
    };
    wallettocontrato.push(comprador);
    
    let totalComisiones = 0;
    let referidoActual = usuario;
    const comisiones = [5, 2, 2, 1];
    
    for (let i = 0; i < comisiones.length; i++) {

      if (referidoActual.referido.length > 0) {
        referidoActual = await User.findOne({ _id: referidoActual.referido });
        const valorPorcentaje = (precioTotal / 100) * comisiones[i];
        totalComisiones += valorPorcentaje;
        const objReferido = {
          wallet: referidoActual.wallet,
          amount: valorPorcentaje.toFixed(6) * e
        };
        referidoActual.usdcomision = (referidoActual.usdcomision + valorPorcentaje).toFixed(6);
        await referidoActual.save();
        wallettocontrato.push(objReferido);
      }
    }
    
    const sobrante = precioTotal - totalComisiones;
    const cuentaSobrante = {
      wallet: "0x6363A840E11495457228E3894d4D0d98F15dA391",
      amount: sobrante.toFixed(6) * e
    };
    wallettocontrato.push(cuentaSobrante);
    
    console.log("wallets que van al contrato", wallettocontrato);
    
    if (fases.fase === 1) {
      usuario.tokensComprados += params.cantidadTokens;
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 10 + usuario.tokensporcomision).toFixed(6);
      usuario.preciocompra = precioTotal.toFixed(6);
    } else if (fases.fase === 2) {
      usuario.tokensComprados += params.cantidadTokens;
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 5 + usuario.tokensporcomision).toFixed(6);
    } else if (fases.fase === 3) {
      usuario.tokensComprados += params.cantidadTokens;
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 1 + usuario.tokensporcomision).toFixed(6);
    }
    
    await usuario.save();
    fases.valortotalVen = (fases.valortotalVen + precioTotal).toFixed(6);
    
    if (fases.tokensDisponibles === 0) {
      try {
        await Fases.updateMany({ fase: { $in: [1, 2, 3] } }, { $set: { faseActiva: false } });
        const nuevaFaseActiva = fases.fase + 1;
        if (nuevaFaseActiva <= 3) {
          await Fases.findOneAndUpdate(
            { fase: nuevaFaseActiva },
            { $set: { faseActiva: true } },
            { new: true }
          );
        }
      } catch (error) {
        console.error("Error al actualizar las fases:", error);
      }
    }
    await fases.save();
    
    const fecha = new Date();
    await transactions.create({ datos: { fases, usuario, fecha } });
    console.log("datos de la transaccion", fases, usuario, fecha);
    return wallettocontrato;
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
  disponiblesPorFase,
  verifyref
};
