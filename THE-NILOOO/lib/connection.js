const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let sock = null;

module.exports = async function connect() {
  try {
    console.log("🔌 Initializing WhatsApp connection...");
    
    // Get authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();
    
    // Create WhatsApp socket
    sock = makeWASocket({
      version: version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.macOS('𝚻𝚮𝚵 𝐋𝚵𝐆𝚴𝚴𝐃𝚫𝚪𝐘 𝚴𝚰𝐋 𝐁𝐎𝐓'),
      getMessage: async (key) => {
        return { conversation: '' };
      }
    });

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n📱 𝚂𝙲𝙰𝙽 𝚃𝙷𝙸𝚂 𝚀𝚁 𝚆𝙸𝚃𝙷 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿:');
        console.log('╔══════════════════════════════════════════════╗');
        qrcode.generate(qr, { small: true });
        console.log('╚══════════════════════════════════════════════╝');
        console.log('📸 Go to WhatsApp → Linked Devices → Scan QR Code\n');
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('🔌 Connection closed...', shouldReconnect ? 'Reconnecting...' : 'Logged out');
        if (shouldReconnect) {
          setTimeout(() => connect(), 3000);
        }
      } else if (connection === 'open') {
        console.log('✅ 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈!');
        console.log('🤖 𝚻𝚮𝚵 𝐋𝚵𝐆𝚴𝚴𝐃𝚫𝚪𝐘 𝚴𝚰𝐋 𝐁𝐎𝐓 𝙸𝚂 𝙽𝙾𝚆 𝚁𝙴𝙰𝙳𝚈!');
        console.log('📦 Loading plugins...');
        loadPlugins();
      }
    });

    // ✅ CRITICAL: Add message event handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        console.log('📩 Message received from:', msg.key.remoteJid.split('@')[0]);
        
        // Use jarvis-md processMessage function
        const jarvisMd = require('jarvis-md');
        await jarvisMd.processMessage(sock, msg);
      } catch (error) {
        console.error('❌ Error handling message:', error.message);
      }
    });

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);
    
    // Make socket globally accessible for obfuscated modules
    global.sock = sock;
    
    console.log("🤖 WhatsApp bot initialized with message handler!");
    return sock;

  } catch (error) {
    console.error("❌ Failed to initialize connection:", error);
    throw error;
  }
};

// Load plugins function
function loadPlugins() {
  try {
    const pluginsDir = path.join(__dirname, '../plugins');
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
    
    console.log(`📂 Found ${files.length} plugins`);
    
    files.forEach(file => {
      try {
        require(path.join(pluginsDir, file));
        console.log(`  ✓ ${file}`);
      } catch (err) {
        console.log(`  ✗ ${file}: ${err.message}`);
      }
    });
    
    console.log('✅ Plugins loaded!');
  } catch (error) {
    console.error('❌ Error loading plugins:', error.message);
  }
}

// Export the socket getter
module.exports.getSock = () => sock;
