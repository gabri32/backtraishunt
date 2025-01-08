const Fases = require('../models/basedatostoken');
const User = require('../models/user');
const transactions = require('../models/transactions')
const { param } = require('../routes/preventaRoutes');





async function validartranscaccion(params) {
    try { console.log("entrooooooooooooooo")
        const user = await User.findOne({ wallet: params.wallet })
    } catch (error) {
        console.error('Error al obtener el usuario:', error.message);
        throw error;
     }
};


module.exports = {
    validartranscaccion
};