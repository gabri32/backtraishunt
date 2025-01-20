const Fases = require('../models/basedatostoken');
const User = require('../models/user');
const transactions = require('../models/transactions')
const { param } = require('../routes/preventaRoutes');
//const { checkBalance } = require('../routes/ldab');


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
async function costotoken(montoUSD) {
  try {
    if (montoUSD <= 10) {
      console.log("montoUSD", montoUSD);
      throw new Error('El monto en dólares debe ser mayor a 10');
    }
    else{
      const faseActiva = true;
      const fases = await Fases.findOne({ faseActiva });
      const cantidadTotalObjetos = fases.cantidadTotal;
      const precioInicial = parseFloat(fases.precioini);
      const precioFinal = parseFloat(fases.preciofin);
      const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
  
      let unidadesVendidas = fases.tokensVendidos; // Tokens ya vendidos
      let tokensRecibidos = 0;
      let totalGastado = 0;
  
      // Iteramos para calcular la cantidad de tokens que se pueden comprar
      while (montoUSD > 0 && unidadesVendidas < fases.tokensDisponibles) {
        const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;
  
        if (montoUSD >= precioUnitario) {
          montoUSD -= precioUnitario;
          totalGastado += precioUnitario;
          tokensRecibidos++;
          unidadesVendidas++;
        } else {
          // Si no alcanza para comprar el siguiente token, salimos del bucle
          break;
        }
      }
  
      // Verifica si se pudieron calcular tokens con el monto proporcionado
      if (tokensRecibidos === 0) {
        return "El monto proporcionado no es suficiente para adquirir ningún token.";
      }
  
      // Devuelve el resultado como un objeto
      return {
        tokensRecibidos: tokensRecibidos,
        totalGastado,
        montoRestante: montoUSD.toFixed(2),
        tokensDisponibles: fases.tokensDisponibles - unidadesVendidas,
      };
    }

  
  } catch (error) {
    console.error('Error al calcular los tokens por monto:', error.message);
  }
}



async function comprarTokens(params) {
  try {
    const e = 10 ** 6//cantidad de ceros para convertir a usd
    const wallettocontrato = []//wallets que se van al contrato para pagos de todo incluyendo la pago de inicial
    // Validar que cantidadTokens sea positivo
    if (params.cantidadTokens <= 0) {
      throw new Error('La cantidad de tokens debe ser mayor a 0');
    }
    const faseActiva = true;
    // Obtener la fase de la Fases desde la base de datos
    const fases = await Fases.findOne({ faseActiva });
    if (fases.tokensDisponibles < params.cantidadTokens) {
      throw new Error('No hay suficientes tokens disponibles en esta fase');
    }
    // Variables necesarias para el cálculo del precio
    const cantidadTotalObjetos = fases.cantidadTotal;
    const precioInicial = parseFloat(fases.precioini);
    const precioFinal = parseFloat(fases.preciofin);
    const aumentoPorUnidad = (precioFinal - precioInicial) / cantidadTotalObjetos;
    // Calcular el precio total de los tokens a comprar
    let precioTotal = 0;
    // Calcula el precio unitario para todos los tokens en esta compra.
    const unidadesVendidas = fases.tokensVendidos; // Tokens ya vendidos
    const precioUnitario = precioInicial + aumentoPorUnidad * unidadesVendidas;

    // Calcula el precio total para la cantidad solicitada
     precioTotal = precioUnitario * params.cantidadTokens;

    // Actualizar los valores en la base de datos
    fases.tokensVendidos = fases.tokensVendidos + params.cantidadTokens;
    fases.precioactual = precioInicial + aumentoPorUnidad * fases.tokensVendidos;
    fases.tokensDisponibles = fases.tokensDisponibles - params.cantidadTokens
    const wallet = params.wallet
    const usuario = await User.findOne({ wallet });

    console.log("datos del comprador", usuario)//datos de quien esta haciendo la transaccion
    const comprador = {
      wallet: usuario.wallet,
      compraUsd: precioTotal.toFixed(6) * e,
    }
    wallettocontrato.push(comprador)
    if (usuario.referido.length > 0)//si el usuario tuvo un referido cuando se registro 
    {
      const _id = usuario.referido//id del primer referido directo 5% comision usd
      const referido1 = await User.findOne({ _id })
      //  console.log("referido de primer nivel", referido1)
      const valor1por = (precioTotal / 100) * 5
      //objeto con los datos de la wallet para el primer referido 5% de comision el dirtecto
      const objreferido1$ = {
        wallet: referido1.wallet,
        comision: valor1por.toFixed(6) * e
      }
      
      // await validartranscaccion(objreferido1$)//validar que el usuario exista y tenga suficiente saldo
      referido1.usdcomision = (referido1.usdcomision + valor1por).toFixed(6);
      referido1.save()
      wallettocontrato.push(objreferido1$)
      if (referido1.referido.length > 0) {
        const _id = referido1.referido//id del segundo referido directo 2% comision usd
        const referido2 = await User.findOne({ _id })
        //  console.log("referido de 2 nivel", referido2)
        const valor2por = (precioTotal / 100) * 2
        //objeto con los datos de la wallet para el primer referido 2% de comision el dirtecto
        const objreferido2$ = {
          wallet: referido2.wallet,
          comision: valor2por.toFixed(6) * e
        }
        referido2.usdcomision = (referido2.usdcomision + valor2por).toFixed(6)
        referido2.save()
        console.log("referido2", referido2)
        wallettocontrato.push(objreferido2$)
        if (referido2.referido.length > 0) {
          const _id = referido2.referido//id del tercer referido directo 2% comision usd
          const referido3 = await User.findOne({ _id })
          //console.log("referido de 3 nivel", referido3)
          const valor3por = (precioTotal / 100) * 2
          //objeto con los datos de la wallet para el tercer referido 2% de comision el dirtecto
          const objreferido3$ = {
            wallet: referido3.wallet,
            comision: valor3por.toFixed(6) * e
          }
          referido3.usdcomision = (referido3.usdcomision + valor3por).toFixed(6)
          referido3.save()
          console.log("referido3", referido3)
          wallettocontrato.push(objreferido3$)
          if (referido3.referido.length > 0) {
            const _id = referido3.referido//id del tercer referido directo 1% comision usd
            const referido4 = await User.findOne({ _id })
            // console.log("referido de 4 nivel", referido3)
            const valor4por = (precioTotal / 100) * 1
            //objeto con los datos de la wallet para el tercer referido 1% de comision el dirtecto
            const objreferido4$ = {
              wallet: referido4.wallet,
              comision: valor4por.toFixed(6) * e
            }
            referido4.usdcomision = (referido4.usdcomision + valor4por).toFixed(6)
            referido4.save()
            console.log("referido4", referido4)
            wallettocontrato.push(objreferido4$)
            const account3percent = (precioTotal / 100) * 3
            const account3 = {
              wallet: "0x3e5f9e7c",
              comision: account3percent.toFixed(6) * e
            }    
            wallettocontrato.push(account3)        
          }
        }
      }
    }
    console.log("wallets que van al contrato", wallettocontrato)
    if (fases.fase == 1) {
      usuario.tokensComprados = params.cantidadTokens + usuario.tokensComprados
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 10 + usuario.tokensporcomision).toFixed(6)
      usuario.preciocompra = precioTotal.toFixed(6)
      await usuario.save();

    }
    if (fases.fase == 2) {
      usuario.tokensComprados = params.cantidadTokens + usuario.tokensComprados
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 5 + usuario.tokensporcomision).toFixed(6)
      await usuario.save();

    }
    if (fases.fase == 3) {
      usuario.tokensComprados = params.cantidadTokens + usuario.tokensComprados
      usuario.tokensporcomision = ((params.cantidadTokens / 100) * 1 + usuario.tokensporcomision).toFixed(6)
      await usuario.save();
    }

    fases.valortotalVen = (fases.valortotalVen + precioTotal).toFixed(6);

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

    const fecha = new Date()
    await transactions.create(
      {
      datos: { fases, usuario, fecha }
    }
  )
  console.log("datos de la transaccion", fases, usuario, fecha)

    console.log(`Compra exitosa. Tokens vendidos en esta fase: ${fases.tokensVendidos}`);
    console.log(`Total pagado por los tokens: ${precioTotal.toFixed(6)}`);

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
