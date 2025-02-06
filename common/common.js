const  crypto = (typeof window === 'undefined') ? require('crypto') : window.crypto; 

class EToServer {
    static REGISTER = 'r';
    static LINK = 'l';
    static HANDSHAKE = 'h';
    static MESSAGE = 'm';
}

class EFromServer {
    static ERROR = 'er';
    static REGISTER_OK = 'ro';
    static LINK_OK = 'lo';
    static HANDSHAKE_DATA = 'hd';
    static CLOSE = 'cl';
    static MESSAGE = 'me';
}


class Utils {
    /**
     * mira si la  clases que existan en el elemento
     * @param {HTMLElement} element 
     * @param {String} clas
     */
    static hasClass(element, clas)
    {
        if (element == undefined || element == null) return false;
        return element.classList.contains(clas);
    }


    /**
     * Añade una o más clases que no existan ya en el elemento
     * @param {HTMLElement} element 
     * @param {String | Array<String>} classes 
     */
    static addClass(element, classes)
    {
        if (element == undefined || element == null) return;

        if (typeof classes === "string")
            classes = classes.split(" ");

        classes.forEach( (value) => { 
            if (value != "")
            {
                if (!element.classList.contains(value))
                element.classList.add(value);
            }
        });
    }

    /**
     * Elimina una o más clases que existan en el elemento
     * @param {HTMLElement} element 
     * @param {String | Array<String>} classes 
     */
    static removeClass(element, classes)
    {
        if (element == undefined || element == null) return;

        if (typeof classes === "string")
            classes = classes.split(" ");

        classes.forEach( (value) => {
            if (value != "")
            {
                if (element.classList.contains(value))
                element.classList.remove(value);
            }
        });
    }

    /**
     * mira si la  clases que existan en el elemento
     * @param {HTMLElement} element 
     * @param {String} clas
     */
    static toggleClass(element, clas)
    {
        if (element == undefined || element == null) return;

        if (this.hasClass(element, clas)) 	this.removeClass(element, clas);
        else 							this.addClass(element, clas);
    } 

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

    // Derivar una clave con PBKDF2 (solo navegador)
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

    static async deriveSessionToken(pass) {
        const encoder = new TextEncoder();
        const passBuffer = encoder.encode(pass);
        const salt = encoder.encode(new Date().toISOString().split("T")[0]); // "YYYY-MM-DD"
    
        if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
            // Navegador (Web Crypto API)
            const keyMaterial = await crypto.subtle.importKey(
                "raw", passBuffer, { name: "PBKDF2" }, false, ["deriveBits"]
            );
            const derivedBits = await crypto.subtle.deriveBits(
                { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
                keyMaterial, 256
            );
            return Array.from(new Uint8Array(derivedBits))
                .map(b => b.toString(16).padStart(2, "0")).join("");
        } else {
            // Node.js
            const crypto = require("crypto");
            return crypto.pbkdf2Sync(pass, salt, 100000, 32, "sha256").toString("hex");
        }
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

    static async encryptSymetricData(sendData, pass) {    
        const raw = JSON.stringify(sendData);

        // Derivar clave
        const salt = (new Date()).toLocaleString();
        const key = await Utils.deriveKey(pass, salt); 

        // Cifrar texto
        const { ciphertext, iv } = await Utils.encryptText(key, raw);
        const res = btoa(iv) + ":" + btoa(salt) + ":" + Utils.bytesToHex(ciphertext);

        return btoa(res);
    }

    static async readSymetricData(pass, dataString) { 
        const parts = atob(dataString).split(":");

        if (parts.length < 3) { 
            return null;
        }

        //parse other data   
        const iv            = new Uint8Array(atob(parts[0]).split(","));
        const salt          = atob(parts[1]);
        const ciphertext    = Utils.hexToBytes(parts[2]);

        // Derivar clave 
        const key = await Utils.deriveKey(pass, salt);

        // Descifrar texto
        const textoDescifrado = await Utils.decryptText(key, ciphertext, iv); 
        const otherData = JSON.parse(textoDescifrado);  
        return otherData != null ? otherData : textoDescifrado;
    }

    static generateRandomHex(bytes = 64) {
        const randomValues = new Uint8Array(bytes);
        window.crypto.getRandomValues(randomValues); // Fill array with cryptographically secure random values
        return Array.from(randomValues)
            .map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to hex
            .join('');
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

    static checkPassword(pass) {
        if (pass.length < 3) return false;
        return true;
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

    static async generateSignKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]), // 65537
                hash: "SHA-256",
            },
            true, // Exportable
            ["sign", "verify"] // Usos de las claves
        );
        return keyPair;
    }

    static async importPublicSignKey(base64Key) {
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
                name: 'RSA-PSS', // O el nombre del algoritmo que vayas a usar
                hash: 'SHA-256', // Hash a utilizar
            },
            true, // Si la clave es extractable
            ['verify'] // Operaciones permitidas con la clave
        );

        return publicKey; // Retorna la CryptoKey importada
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

    static async hybridEncrypt(publicKey, textData) { 
        const secret = typeof crypto !== 'undefined' && typeof crypto.randomBytes === 'function' 
                     ? crypto.randomBytes(64).toString('hex') 
                     : Utils.generateRandomHex(64);   
        const encryptedSecret   = await UtilsAsymetric.encryptWithPublicKey(publicKey, secret);
        const hexSecret         = Array.from(encryptedSecret).map((b) => b.toString(16).padStart(2, '0')).join(''); 
        const encryptedData     = await Utils.encryptSymetricData(textData, secret);

        return { secret: hexSecret, packet: encryptedData};
    }

    static async hybridDecrypt(privateKey, {secret, packet}) { 
        const secretDec = await UtilsAsymetric.decryptWithPrivateKey(privateKey, Utils.hexToBytes(secret));   
        const received  = await Utils.readSymetricData(secretDec, packet);    

        return received;
    }
}

// Exportar clases y enums
module.exports = {
    Utils,
    UtilsAsymetric,
    EToServer,
    EFromServer,
};