// Init Express
const express = require("express");
const router = express.Router();
require("dotenv").config();
const Web3 = require("web3");

const ethers = require("ethers");


// Dirección del contrato USDT en Polygon (Mainnet)
const USDT_CONTRACT_ADDRESS = "0x...."; // Sustituye con la dirección del contrato USDT


const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com"); 


/**
 * Validar si el usuario está logueado (conectado a la DApp)
 */
router.get("/is-connected", (req, res) => {
  if (!req.headers["user-wallet"]) {
    return res.status(400).json({ message: "No se detectó ninguna wallet" });
  }

  const walletAddress = req.headers["user-wallet"];
  const isValid = ethers.utils.isAddress(walletAddress);

  if (!isValid) {
    return res.status(400).json({ message: "Wallet inválida" });
  }

  res.status(200).json({ message: "Usuario conectado", wallet: walletAddress });
});

/**
 * Validar el saldo del usuario en USDT
 */
router.get("/validate-usdt", async (req, res) => {
  const walletAddress = req.headers["user-wallet"];
  const requiredAmount = ethers.utils.parseUnits(req.query.amount || "0", 6); // Mínimo en USDT

  if (!walletAddress) {
    return res.status(400).json({ message: "No se proporcionó una wallet" });
  }

  try {
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
    const balance = await usdtContract.balanceOf(walletAddress);

    if (balance.gte(requiredAmount)) {
      res.status(200).json({ message: "Saldo suficiente en USDT", balance: ethers.utils.formatUnits(balance, 6) });
    } else {
      res.status(400).json({ message: "Saldo insuficiente en USDT", balance: ethers.utils.formatUnits(balance, 6) });
    }
  } catch (error) {
    console.error("Error al validar saldo USDT:", error);
    res.status(500).json({ message: "Error al validar saldo USDT", error });
  }
});

/**
 * Validar el saldo del usuario en MATIC
 */
router.get("/validate-matic", async (req, res) => {
  const walletAddress = req.headers["user-wallet"];
  const requiredAmount = ethers.utils.parseEther(req.query.amount || "0"); // Mínimo en MATIC

  if (!walletAddress) {
    return res.status(400).json({ message: "No se proporcionó una wallet" });
  }

  try {
    const balance = await provider.getBalance(walletAddress);

    if (balance.gte(requiredAmount)) {
      res.status(200).json({ message: "Saldo suficiente en MATIC", balance: ethers.utils.formatEther(balance) });
    } else {
      res.status(400).json({ message: "Saldo insuficiente en MATIC", balance: ethers.utils.formatEther(balance) });
    }
  } catch (error) {
    console.error("Error al validar saldo MATIC:", error);
    res.status(500).json({ message: "Error al validar saldo MATIC", error });
  }
});

module.exports = router;

