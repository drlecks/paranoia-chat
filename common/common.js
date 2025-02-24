const crypto = (typeof window === 'undefined') ? require('crypto') : window.crypto;

class CommonConfig {
    static PASSWORD_MIN_LENGTH = 12;
    static PASSWORD_MAX_LENGTH = 512;
    static PASSWORD_MIN_WORDS = 3;
}

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
     * Checks if the class exists in the element
     * @param {HTMLElement} element 
     * @param {String} clas
     */
    static hasClass(element, clas) {
        if (element == undefined || element == null) return false;
        return element.classList.contains(clas);
    }

    /**
     * Adds one or more classes that do not already exist in the element
     * @param {HTMLElement} element 
     * @param {String | Array<String>} classes 
     */
    static addClass(element, classes) {
        if (element == undefined || element == null) return;

        if (typeof classes === "string")
            classes = classes.split(" ");

        classes.forEach((value) => {
            if (value != "") {
                if (!element.classList.contains(value))
                    element.classList.add(value);
            }
        });
    }

    /**
     * Removes one or more classes that exist in the element
     * @param {HTMLElement} element 
     * @param {String | Array<String>} classes 
     */
    static removeClass(element, classes) {
        if (element == undefined || element == null) return;

        if (typeof classes === "string")
            classes = classes.split(" ");

        classes.forEach((value) => {
            if (value != "") {
                if (element.classList.contains(value))
                    element.classList.remove(value);
            }
        });
    }

    /**
     * Toggles the class in the element
     * @param {HTMLElement} element 
     * @param {String} clas
     */
    static toggleClass(element, clas) {
        if (element == undefined || element == null) return;

        if (this.hasClass(element, clas)) this.removeClass(element, clas);
        else this.addClass(element, clas);
    }

    // Function to convert Uint8Array to a hexadecimal string
    static bytesToHex(bytes) {
        return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    // Function to convert a hexadecimal string to Uint8Array
    static hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    // Derive a key with PBKDF2 (browser only)
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
                iterations: 100000, // Number of iterations (adjust as needed)
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
            // Browser (Web Crypto API)
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

    // Encrypt text
    static async encryptText(key, plaintext) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector (IV)

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

    // Decrypt text
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

        // Derive key
        const salt = (new Date()).toLocaleString();
        const key = await Utils.deriveKey(pass, salt);

        // Encrypt text
        const { ciphertext, iv } = await Utils.encryptText(key, raw);
        const res = btoa(iv) + ":" + btoa(salt) + ":" + Utils.bytesToHex(ciphertext);

        return btoa(res);
    }

    static async readSymetricData(pass, dataString) {
        const parts = atob(dataString).split(":");

        if (parts.length < 3) {
            return null;
        }

        // Parse other data
        const iv = new Uint8Array(atob(parts[0]).split(","));
        const salt = atob(parts[1]);
        const ciphertext = Utils.hexToBytes(parts[2]);

        // Derive key
        const key = await Utils.deriveKey(pass, salt);

        // Decrypt text
        const decryptedText = await Utils.decryptText(key, ciphertext, iv);
        const otherData = JSON.parse(decryptedText);
        return otherData != null ? otherData : decryptedText;
    }

    static generateRandomHex(bytes = 64) {
        const randomValues = new Uint8Array(bytes);
        window.crypto.getRandomValues(randomValues); // Fill array with cryptographically secure random values
        return Array.from(randomValues)
            .map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to hex
            .join('');
    }

    static isLocalIp(ip) {
        const parts = ip.split('.'); // Split the IP into parts by dots

        if (parts.length !== 4) {
            return false; // Not a valid IP if it doesn't have 4 parts
        }

        const [a, b] = [parseInt(parts[0]), parseInt(parts[1])];

        // Check if the IP is in the range 10.x.x.x
        if (a === 10) {
            return true;
        }

        // Check if the IP is in the range 127.x.x.x (loopback)
        if (a === 127) {
            return true;
        }

        // Check if the IP is in the range 192.168.x.x
        if (a === 192 && b === 168) {
            return true;
        }

        // Check if the IP is in the range 172.16.0.0 - 172.31.255.255
        if (a === 172 && b >= 16 && b <= 31) {
            return true;
        }

        // If it doesn't meet any of these criteria, it's not a local IP
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
        if (pass.length < CommonConfig.PASSWORD_MIN_LENGTH) return { success: false, message: "Password is too short" };

        if (pass.length > CommonConfig.PASSWORD_MAX_LENGTH) return { success: false, message: "Password is too long" };

        if (pass.trim().split(/\s+/).length < CommonConfig.PASSWORD_MIN_WORDS) return { success: false, message: "Password needs at least 3 words" }; 

        return { success: true, message: "" };
    }
}

class UtilsAsymetric {
    // Generate a key pair (public and private)
    static async generateKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048, // Modulus length
                publicExponent: new Uint8Array([1, 0, 1]), // Public exponent
                hash: 'SHA-256', // Hash algorithm
            },
            true, // Exportable
            ['encrypt', 'decrypt'] // Key usages
        );
        return keyPair;
    }

    // Export the public key in SPKI format
    static async exportPublicKey(key) {
        const exportedKey = await crypto.subtle.exportKey('spki', key);
        return btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // Encode in Base64
    }

    static async importPublicKey(base64Key) {
        // Decode the base64 key to ArrayBuffer
        const binaryKey = atob(base64Key);
        const arrayBuffer = new ArrayBuffer(binaryKey.length);
        const view = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryKey.length; i++) {
            view[i] = binaryKey.charCodeAt(i);
        }

        // Import the public key using the 'spki' format
        const publicKey = await crypto.subtle.importKey(
            'spki', // Key format
            arrayBuffer, // The exported key in ArrayBuffer
            {
                name: 'RSA-OAEP', // Or the name of the algorithm you are going to use
                hash: 'SHA-256', // Hash to use
            },
            true, // If the key is extractable
            ['encrypt'] // Allowed operations with the key
        );

        return publicKey; // Returns the imported CryptoKey
    }

    // Encrypt with public key
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

    // Decrypt with private key
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
            ["sign", "verify"] // Key usages
        );
        return keyPair;
    }

    static async importPublicSignKey(base64Key) {
        // Decode the base64 key to ArrayBuffer
        const binaryKey = atob(base64Key);
        const arrayBuffer = new ArrayBuffer(binaryKey.length);
        const view = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryKey.length; i++) {
            view[i] = binaryKey.charCodeAt(i);
        }

        // Import the public key using the 'spki' format
        const publicKey = await crypto.subtle.importKey(
            'spki', // Key format
            arrayBuffer, // The exported key in ArrayBuffer
            {
                name: 'RSA-PSS', // Or the name of the algorithm you are going to use
                hash: 'SHA-256', // Hash to use
            },
            true, // If the key is extractable
            ['verify'] // Allowed operations with the key
        );

        return publicKey; // Returns the imported CryptoKey
    }

    // Sign data with private key
    static async signWithPrivateKey(privateKey, plaintext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Sign the hash of the data
        const signature = await crypto.subtle.sign(
            {
                name: 'RSA-PSS', // Recommended digital signature algorithm
                saltLength: 32, // Salt length
            },
            privateKey,
            data
        );

        return new Uint8Array(signature); // Signature as ArrayBuffer
    }

    // Verify the signature with public key
    static async verifyWithPublicKey(publicKey, plaintext, signature) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Verify the digital signature
        const isValid = await crypto.subtle.verify(
            {
                name: 'RSA-PSS',
                saltLength: 32,
            },
            publicKey,
            signature,
            data
        );

        return isValid; // Returns true if the signature is valid, false otherwise
    }

    static async hybridEncrypt(publicKey, textData) {
        const secret = typeof crypto !== 'undefined' && typeof crypto.randomBytes === 'function'
            ? crypto.randomBytes(64).toString('hex')
            : Utils.generateRandomHex(64);
        const encryptedSecret = await UtilsAsymetric.encryptWithPublicKey(publicKey, secret);
        const hexSecret = Array.from(encryptedSecret).map((b) => b.toString(16).padStart(2, '0')).join('');
        const encryptedData = await Utils.encryptSymetricData(textData, secret);

        return { secret: hexSecret, packet: encryptedData };
    }

    static async hybridDecrypt(privateKey, { secret, packet }) {
        const secretDec = await UtilsAsymetric.decryptWithPrivateKey(privateKey, Utils.hexToBytes(secret));
        const received = await Utils.readSymetricData(secretDec, packet);

        return received;
    }
}

// Export classes and enums
module.exports = {
    Utils,
    UtilsAsymetric,
    EToServer,
    EFromServer,
    CommonConfig
};