const WebSocket = require('ws');
const crypto = require('crypto');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });
const doLog = true;

class EToServer {
    static REGISTER = 'r';
    static LINK = 'l';
    static MESSAGE = 'm';
}

class EFromServer {
    static ERROR = 'er';
    static REGISTER_OK = 'ro';
    static LINK_DATA = 'ld';
    static CLOSE = 'cl';
    static MESSAGE = 'me';
}

class Chat {
    token = '';
    client1 = {};
    client2 = {};
}

class Utils {
    // Función para convertir Uint8Array a una cadena hexadecimal
    static bytesToHex(bytes) {
        return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    // Función para convertir una cadena hexadecimal a Uint8Array
    static hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    // Derivar una clave con PBKDF2
    static async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000, // Número de iteraciones (ajustar según necesidad)
                hash: 'SHA-256',
            },
            passwordKey,
            {
                name: 'AES-GCM',
                length: 256,
            },
            false,
            ['encrypt', 'decrypt']
        );

        return key;
    }

    // Cifrar texto
    static async encryptText(key, plaintext) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Vector de inicialización (IV)

        const ciphertext = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encoder.encode(plaintext)
        );

        return {
            ciphertext: new Uint8Array(ciphertext),
            iv: iv,
        };
    }

    // Descifrar texto
    static async decryptText(key, ciphertext, iv) {
        const decoder = new TextDecoder();

        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            ciphertext
        );

        return decoder.decode(plaintext);
    }

    static isLocalIp(ip) {
        const parts = ip.split('.'); // Dividir la IP en partes por los puntos

        if (parts.length !== 4) {
            return false; // No es una IP válida si no tiene 4 partes
        }

        const [a, b] = [parseInt(parts[0]), parseInt(parts[1])];

        // Verificar si la IP es del rango 10.x.x.x
        if (a === 10) {
            return true;
        }

        // Verificar si la IP es del rango 127.x.x.x (loopback)
        if (a === 127) {
            return true;
        }

        // Verificar si la IP es del rango 192.168.x.x
        if (a === 192 && b === 168) {
            return true;
        }

        // Verificar si la IP está en el rango 172.16.0.0 - 172.31.255.255
        if (a === 172 && b >= 16 && b <= 31) {
            return true;
        }

        // Si no cumple con ninguno de estos criterios, no es una IP local
        return false;
    }

    static copyToClipboard(copyText) {
        navigator.clipboard
            .writeText(copyText)
            .then(() => {
                console.log('Text copied to clipboard!');
            })
            .catch((err) => {
                console.log('Failed to copy text: ' + err);
            });
    }
}

class UtilsAsymetric {
    // Generar un par de claves (pública y privada)
    static async generateKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048, // Longitud del módulo
                publicExponent: new Uint8Array([1, 0, 1]), // Exponente público
                hash: 'SHA-256', // Algoritmo de hash
            },
            true, // Exportable
            ['encrypt', 'decrypt'] // Usos de las claves
        );
        return keyPair;
    }

    // Exportar la clave pública en formato SPKI
    static async exportPublicKey(key) {
        const exportedKey = await crypto.subtle.exportKey('spki', key);
        return btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // Codificar en Base64
    }

    static async importPublicKey(base64Key) {
        // Decodificar la clave base64 a ArrayBuffer
        const binaryKey = atob(base64Key);
        const arrayBuffer = new ArrayBuffer(binaryKey.length);
        const view = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryKey.length; i++) {
            view[i] = binaryKey.charCodeAt(i);
        }

        // Importar la clave pública usando el formato 'spki'
        const publicKey = await crypto.subtle.importKey(
            'spki', // Formato de la clave
            arrayBuffer, // La clave exportada en ArrayBuffer
            {
                name: 'RSA-OAEP', // O el nombre del algoritmo que vayas a usar
                hash: 'SHA-256', // Hash a utilizar
            },
            true, // Si la clave es extractable
            ['encrypt'] // Operaciones permitidas con la clave
        );

        return publicKey; // Retorna la CryptoKey importada
    }

    // Cifrar con clave pública
    static async encryptWithPublicKey(publicKey, plaintext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            data
        );
        return new Uint8Array(ciphertext);
    }

    // Descifrar con clave privada
    static async decryptWithPrivateKey(privateKey, ciphertext) {
        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP',
            },
            privateKey,
            ciphertext
        );
        const decoder = new TextDecoder();
        return decoder.decode(plaintext);
    }

    // Firmar datos con clave privada
    static async signWithPrivateKey(privateKey, plaintext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Firmar el hash de los datos
        const signature = await crypto.subtle.sign(
            {
                name: 'RSA-PSS', // Algoritmo de firma digital recomendado
                saltLength: 32, // Longitud del salt
            },
            privateKey,
            data
        );

        return new Uint8Array(signature); // Firma como ArrayBuffer
    }

    // Verificar la firma con clave pública
    static async verifyWithPublicKey(publicKey, plaintext, signature) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Verificar la firma digital
        const isValid = await crypto.subtle.verify(
            {
                name: 'RSA-PSS',
                saltLength: 32,
            },
            publicKey,
            signature,
            data
        );

        return isValid; // Devuelve true si la firma es válida, false en caso contrario
    }
}

// Store registered clients with their tokens
const chats = {};

function clog(message) {
    if (doLog) console.log(message);
}
function cerror(message) {
    if (doLog) console.error(message);
}

async function returnDataToClient(ws, status, dataText) {
    const sendData = { result: dataText, sign: '' };
    sendData.sign = await UtilsAsymetric.signWithPrivateKey(
        myKey.privateKey,
        dataText
    );
    ws.send(JSON.stringify({ status: status, rsult: dataText }));
}

async function getAllFromPayload(payload) {
    var res = true;
    var error = '';
    var chat = null;

    const decryptedData = await UtilsAsymetric.decryptWithPrivateKey(
        myKey.privateKey,
        Utils.hexToBytes(payload)
    );
    const data = JSON.parse(decryptedData);

    // Validate the token format (32-byte hex string)
    if (!/^[a-f0-9]{64}$/.test(data.token)) {
        res = false;
        error = 'Invalid token format received: ' + data.token;
    } else if (!chats[data.token]) {
        res = false;
        error = 'Token not found or client disconnected: ' + data.token;
    } else {
        res = true;
        chat = chats[data.token];
    }

    return { res, chat, data, error };
}

clog(`WebSocket server running on port ${port}`);

var myKey = {};
(async () => {
    myKey = await UtilsAsymetric.generateKeyPair();
    myKey.key64 = await UtilsAsymetric.exportPublicKey(myKey.publicKey);
    clog(`Key generated`);
})().catch(cerror);

server.on('connection', (ws) => {
    clog('New client connected');

    ws.on('message', (message) => {
        try {
            (async () => {
                const { type, payload } = JSON.parse(message);

                if (type === EToServer.REGISTER) {
                    const chat = new Chat();
                    // Generate a secure random 32-byte token in hexadecimal format
                    chat.token          = crypto.randomBytes(32).toString('hex');
                    chat.client1        = ws;
                    chats[chat.token]   = chat;

                    const clientKey     = await UtilsAsymetric.importPublicKey(payload);
                    const encryptedSend = await UtilsAsymetric.encryptWithPublicKey(clientKey, chat.token);
                    const hexSend       = Array.from(encryptedSend).map((b) => b.toString(16).padStart(2, '0')).join('');

                    clog(`Client registered with token: ${chat.token}`);
                    await returnDataToClient(ws, EFromServer.REGISTER_OK, hexSend);
                } else if (type === EToServer.LINK) {
                    const { res, chat, data, error } = getAllFromPayload(payload);
                    if (!res) {
                        await returnDataToClient(ws, EFromServer.ERROR, error);
                        cerror(error);
                        return;
                    }

                    chat.client2 = ws;
                    await returnDataToClient(chat.client1, EFromServer.LINK_DATA, data.data);
                } else if (type === EToServer.MESSAGE) {
                    const { res, chat, data, error } = getAllFromPayload(payload);
                    if (!res) {
                        await returnDataToClient(ws, EFromServer.ERROR, error);
                        cerror(error);
                        return;
                    }

                    const sendClient = ws == chat.client1 ? chat.client2 : chat.client1;
                    await returnDataToClient(null, sendClient, EFromServer.MESSAGE, data.data );
                }
            })();
        } catch (err) {
            cerror('Error processing message:', err);
            ws.send(
                JSON.stringify({status: EFromServer.ERROR, message: 'Invalid message. ' + err})
            );
        }
    });

    ws.on('close', () => {
        clog('Client disconnected');
        // Remove the disconnected client from the list
        Object.keys(chats).forEach((key) => {
            if (chats[key].client1 === ws) {
                if (chats[key].client2)
                    chats[key].client2.close(1000, 'Other client disconnected');
                delete chats[key];
                clog(`Client with token ${key} removed`);
            } else if (chats[key].client2 === ws) {
                if (chats[key].client1)
                    chats[key].client1.close(1000, 'Other client disconnected');
                delete chats[key];
                clog(`Client with token ${key} removed`);
            }
        });
    });

    ws.on('error', (err) => {
        cerror('WebSocket error:', err);
    });
});
