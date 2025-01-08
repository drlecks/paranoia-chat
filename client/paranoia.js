
var steps = null;
var connection = null;

document.body.onload = function() {
    connection = new Connection();
    steps = new StepManager(); 
};


class StepManager
{
    containerStepStart = null;
    containerStepNew = null;
    containerStepJoin = null;
    containerLoading = null;
    containerChat = null;

    stepStart_New = null;
    stepStart_Join = null;
 
    stepNew_Api = null;
    stepNew_Pass = null;
    stepNew_Generate = null;
 
    stepJoin_Data = null;
    stepJoin_Pass = null;
    stepJoin_Connect = null;

    stepLoading_Status = null;

    constructor() {

        //elements
        this.containerStepStart = document.getElementById('step1');
        this.containerStepNew = document.getElementById('step2New');
        this.containerStepJoin = document.getElementById('step2Connect');
        this.containerLoading = document.getElementById('loading'); 
        this.containerError = document.getElementById('error'); 
        this.containerChat = document.getElementById('chat'); 

        this.stepStart_New = document.getElementById('newConnection');
        this.stepStart_Join = document.getElementById('connectToUser');

        this.stepNew_Pass = document.getElementById('newPassword');
        this.stepNew_Api = document.getElementById('newProvider');
        this.stepNew_ApiChange = document.getElementById('newChangeProvider');
        this.stepNew_Generate = document.getElementById('generateConnection');

        this.stepJoin_Data = document.getElementById('connectData');
        this.stepJoin_Pass = document.getElementById('connectPassword');
        this.stepJoin_Api = document.getElementById('connectProvider');
        this.stepJoin_ApiChange = document.getElementById('connectChangeProvider');
        this.stepJoin_Connect = document.getElementById('connect');

		this.stepLoading_Spinner = document.getElementById('loadingSpinner');
        this.stepLoading_Status = document.getElementById('loadingStatus');
		this.stepLoading_CopyContainer = document.getElementById('loadingCopyContainer');
		this.stepLoading_CopyText = document.getElementById('loadingCopyText');

        this.stepError_Restart = document.getElementById('restart');
        this.stepError_Text = document.getElementById('errorText');

        this.stepChat_Status = document.getElementById('chatStatus');
        this.stepChat_Content  = document.getElementById('chatContent');
        this.stepChat_Text  = document.getElementById('chatText'); 
        this.stepChat_Send  = document.getElementById('chatSend'); 

        //listeners
        this.stepStart_New.addEventListener('click', this.onButton_StepStart_New.bind(this) , false);
        this.stepStart_Join.addEventListener('click', this.onButton_StepStart_Join.bind(this) , false);
        this.stepNew_Generate.addEventListener('click', this.onButton_StepNew_Generate.bind(this) , false);
        this.stepJoin_Connect.addEventListener('click', this.onButton_StepJoin_Connect.bind(this) , false);
        this.stepError_Restart.addEventListener('click', this.onButton_StepError_Restart.bind(this) , false);

        this.stepNew_ApiChange.addEventListener('click', () => { Utils.toggleClass(this.stepNew_ApiChange, 'hide'); Utils.toggleClass(this.stepNew_Api, 'hide');} , false);
        this.stepJoin_ApiChange.addEventListener('click', () => { Utils.toggleClass(this.stepJoin_ApiChange, 'hide'); Utils.toggleClass(this.stepJoin_Api, 'hide');} , false);

		this.stepLoading_CopyContainer.addEventListener('click', this.onButton_StepLoading_CopyContainer.bind(this) , false);
		

        this.stepChat_Send.addEventListener('click', this.onButton_StepChat_Send.bind(this) , false);
		 
        this.stepNew_Api.value = connection.socketUrl;
        this.stepJoin_Api.value = connection.socketUrl;
        this.stepChat_Status.innerHTML = "Hello!"; 
        this.stepChat_Content.innerHTML = ""; 
    }  

    showStepStart() {
        Utils.removeClass(this.containerStepStart, 'hide');

        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerStepJoin, 'hide');
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 
    }

    showStepNew() {
        Utils.removeClass(this.containerStepNew, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepJoin, 'hide');
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 
    }

    showStepConnect() {
        Utils.removeClass(this.containerStepJoin, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 
    }

    showLoading(status = '') {
        Utils.removeClass(this.containerLoading, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerStepJoin, 'hide'); 
        Utils.addClass(this.containerError, 'hide'); 
        Utils.addClass(this.containerChat, 'hide'); 

        if (status == '')   this.stepLoading_Status.innerHTML = "Loading...";
        else                this.stepLoading_Status.innerHTML = status;
 
		Utils.removeClass(this.stepLoading_Spinner, 'hide');
		Utils.addClass(this.stepLoading_CopyContainer, 'hide');
    }

	showLoadingCopy(copyText) {
		this.stepLoading_CopyText.innerText = copyText;

		Utils.addClass(this.stepLoading_Spinner, 'hide');
		Utils.removeClass(this.stepLoading_CopyContainer, 'hide');
	}

    showError(text = '') {
        Utils.removeClass(this.containerError, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerStepJoin, 'hide'); 
        Utils.addClass(this.containerLoading, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 

        if (text == '') this.stepLoading_Status.innerHTML = "Error, try it again!";
        else            this.stepError_Text.innerHTML = text;
    }

    showChat() { 
        Utils.removeClass(this.containerChat, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerStepJoin, 'hide'); 
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide'); 
    }

    onButton_StepStart_New() {
        this.showStepNew();
    }

    onButton_StepStart_Join() {
        this.showStepConnect();
    }

    onButton_StepNew_Generate() {
        this.showLoading(); 
        this.stepChat_Status.innerHTML = "Connecting..."; 
        connection.connectClientA();
    }

    onButton_StepJoin_Connect() {
        this.showLoading(); 
        this.stepChat_Status.innerHTML = "Connecting..."; 
        connection.connectClientB(); 
    }

    onButton_StepError_Restart() {
        this.stepChat_Status.innerHTML = "Hello!"; 
        this.showStepStart();
    }

	onButton_StepLoading_CopyContainer(){
		
		Utils.copyToClipboard(this.stepLoading_CopyText.innerText);
	}

    onButton_StepChat_Send() {
        const text = this.stepChat_Text.value;
        this.stepChat_Text.value = ""; 

        connection.sendPeerMessage(text);
        this.addMessage(true, text); 
    } 

    addMessage(isMine, text) {
        const ele = document.createElement("div");
        Utils.addClass(ele, ["message", isMine ? "sent" : "received"]);
        ele.innerText = text;
        this.stepChat_Content.append(ele);
        this.stepChat_Content.scrollTop = this.stepChat_Content.scrollHeight;
    }
}

class EToServer {
    static REGISTER = "r";
    static LINK     = "l"; 
    static MESSAGE  = "m";
} 

class EFromServer {
    static ERROR        = "er";
    static REGISTER_OK  = "ro";
    static LINK_DATA    = "ld";
    static CLOSE        = "cl"; 
    static MESSAGE      = "me"; 
} 


class Connection
{  
    socketUrl = "wss://paranoia-chat.onrender.com";
    socket = null;
    sessionToken = "";
    success = false;

    myKey = {
        publicKey: "",
        privateKey: "",
    }; 
    myPublic64 = "";
    serverPublic64 = "";
    serverPublicKey = null;
    otherPublicKey = null;  

    connectClientA() {  
        (async () => {   

            // Generar par de claves
            this.myKey = await UtilsAsymetric.generateKeyPair();
            console.log(this.myKey);
            this.myPublic64 = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);

            this.initSocket( () => {
                this.socket.send(JSON.stringify({type: EToServer.REGISTER, payload: this.myPublic64}));
                steps.showLoading("Signaling... Ok");
            });

        })().catch(console.error);  
    } 

    connectClientB() {   
        (async () => {   
            // Generar par de claves
            this.myKey = await UtilsAsymetric.generateKeyPair();
            console.log(this.myKey);
            this.myPublic64 = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);

            //read first client data
            const firstData         = await this.readSymetricData(steps.stepJoin_Pass.value, steps.stepJoin_Data.value); 
            this.sessionToken       = firstData.sessionToken;
            this.otherPublicKey     = await UtilsAsymetric.importPublicKey(otherData.clientPublic64);
            this.serverPublic64     = otherData.serverPublic64;
            this.serverPublicKey    = await UtilsAsymetric.importPublicKey(this.serverPublic64);
 
            //connect
            this.initSocket( () => {
                (async () => {   
                    const myEncripted = await this.encryptSymetricData({key: this.myPublic64}, steps.stepJoin_Pass.value);
                    steps.stepJoin_Pass.value = "";
                    this.sendSocketData(EToServer.LINK, myEncripted); 
                    this.success = true;
                })().catch(console.error);  
            });
        })().catch(console.error);  
    } 

    async encryptSymetricData(sendData, pass) {   
        console.log('send data:', sendData);
        const raw = JSON.stringify(sendData);

        // Derivar clave
        const salt = (new Date()).toLocaleString();
        const key = await Utils.deriveKey(pass, salt); 

        // Cifrar texto
        const { ciphertext, iv } = await Utils.encryptText(key, raw);
        const res = btoa(iv) + ":" + btoa(salt) + ":" + Utils.bytesToHex(ciphertext);

        return res;
    }

    async readSymetricData(pass, dataString) { 
		const parts = dataString.split(":");

		if (parts.length < 3) {
			steps.showError("Invalid connection data");
			return;
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

        console.log('Texto descifrado:', otherData);  
        return otherData;
    }

    sendChatMessage(text) { 
        this.sendSocketData(EToServer.MESSAGE, text);
    }
 
    onRegisterOk(registerText)
    {
        const registerData = JSON.parse(registerText);
        (async () => {   
            this.sessionToken    = registerData.token;
            this.serverPublic64  = registerData.key;
            this.serverPublicKey = await UtilsAsymetric.importPublicKey(registerData.key);
 
            const sendData = {
                sessionToken: this.sessionToken,
                clientPublic64: this.myPublic64,
                serverPublic64: this.serverPublic64,
            }; 
            const res = await this.encryptSymetricData(sendData, steps.stepNew_Pass.value);
            console.log('Texto cifrado:', res);  

            steps.showLoading("Waiting for client B... Press the code below to copy to clipboard and send it to your other peer"); 
			steps.showLoadingCopy(res);

        })().catch(console.error); 
    }

    onLinkData(data)
    {
        (async () => {   
            steps.showLoading("Waiting for connection..."); 
            const otherData = await this.readSymetricData(steps.stepNew_Pass.value, data);
            this.otherPublicKey = await UtilsAsymetric.importPublicKey(otherData.key);
            this.success = true;
            steps.stepNew_Pass.value = "";
            steps.showChat();
        })().catch(console.error); 
    }
 
    onChatMessage(message) { 
        steps.addMessage(false, message);
    } 

     
    //SOCKET
    initSocket(callback = null) {

        steps.showLoading("Signaling...");

        this.socket = new WebSocket(this.socketUrl);

        this.socket.onopen = () => {
          console.log("Connection established with the server"); 
          if (callback != null) callback();  
        };
        
        this.socket.onmessage = this.onSocketMessage.bind(this);
        this.socket.onerror = this.onSocketError.bind(this); 
        this.socket.onclose = this.onSocketClose.bind(this);
    }

    sendSocketData(type, textData) { 
        (async () => {   
            // Cifrar con clave pública otro
            const encryptedData = await UtilsAsymetric.encryptWithPublicKey(this.otherPublicKey, textData);
            const hex = Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join(''); 

            // Cifrar con clave pública server
            const send = {
                token: this.sessionToken,
                data: hex,
            };
            const encryptedSend = await UtilsAsymetric.encryptWithPublicKey(this.serverPublicKey, send);
            const hexSend = Array.from(encryptedSend).map(b => b.toString(16).padStart(2, '0')).join(''); 

            this.socket.send({type: type, payload: hexSend});
        })().catch(console.error);     
    }
   
    onSocketMessage(event) { 
        (async () => {  
            console.log("Received event:", event);
            // Descifrar con clave privada 
            const decryptedData = await UtilsAsymetric.decryptWithPrivateKey(this.myKey.privateKey, Utils.hexToBytes(event.data)); 
            const data = JSON.parse(decryptedData);
            console.log("Texto Descifrado:", data);
  
            if (data.status === EFromServer.REGISTER_OK) {
                console.log("Registration successful. Token:", data.result);
                this.onRegisterOk(data.result);
            } 
            else 
            {
                //check signature
                const check = await UtilsAsymetric.verifyWithPublicKey(this.serverPublic64, JSON.stringify(data.result), data.sign);
                if (!check) {
                    steps.showError("Invalid server signature received");
                }
                else {
                    if (data.status === EFromServer.LINK_DATA) {
                        console.log("Link successful. data:", data.result);
                        this.onLinkData(data.result);
                    } else if (data.status === EFromServer.MESSAGE) {
                        console.log("New message:", data.result);
                        this.onChatMessage(data.result);
                    } else if (data.status === EFromServer.ERROR) {
                        console.log("Error. message:", data.result);
                        steps.showError(data.result);
                    } else {
                        console.log("Message unknown received:", data);
                        steps.showError("Message unknown received");
                    } 
                } 
            } 
        })().catch(console.error);    
    }

    onSocketError(err) {
        console.error("Socket error", err);
        steps.showError("Connection error" );
    }

    onSocketClose() {
        console.log("Connection closed");
        steps.showError("Connection closed" );
    }
}
 

class Utils
{ 
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
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
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
                hash: 'SHA-256'
            },
            passwordKey,
            {
                name: 'AES-GCM',
                length: 256
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
                iv: iv
            },
            key,
            encoder.encode(plaintext)
        );

        return {
            ciphertext: new Uint8Array(ciphertext),
            iv: iv
        };
    }

    // Descifrar texto
    static async decryptText(key, ciphertext, iv) {
        const decoder = new TextDecoder();

        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );

        return decoder.decode(plaintext);
    }

	static isLocalIp(ip) {
		const parts = ip.split('.');  // Dividir la IP en partes por los puntos
		
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
		navigator.clipboard.writeText(copyText).then(() => {
			console.log("Text copied to clipboard!");
		}).catch(err => {
			console.log("Failed to copy text: " + err);
		});
	}
}
 


class UtilsAsymetric
{
    // Generar un par de claves (pública y privada)
    static async generateKeyPair() {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,          // Longitud del módulo
                publicExponent: new Uint8Array([1, 0, 1]), // Exponente público
                hash: "SHA-256"               // Algoritmo de hash
            },
            true,  // Exportable
            ["encrypt", "decrypt"] // Usos de las claves
        );
        return keyPair;
    }

    // Exportar la clave pública en formato SPKI
    static async exportPublicKey(key) {
        const exportedKey = await crypto.subtle.exportKey("spki", key);
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
            "spki",                          // Formato de la clave
            arrayBuffer,                     // La clave exportada en ArrayBuffer
            {
                name: "RSA-OAEP",             // O el nombre del algoritmo que vayas a usar
                hash: "SHA-256",              // Hash a utilizar
            },
            true,                             // Si la clave es extractable
            ["encrypt"]                       // Operaciones permitidas con la clave
        );
    
        return publicKey;                    // Retorna la CryptoKey importada
    }

    // Cifrar con clave pública
    static async encryptWithPublicKey(publicKey, plaintext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
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
                name: "RSA-OAEP"
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
                name: "RSA-PSS", // Algoritmo de firma digital recomendado
                saltLength: 32  // Longitud del salt
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
                name: "RSA-PSS",
                saltLength: 32
            },
            publicKey,
            signature,
            data
        );

        return isValid; // Devuelve true si la firma es válida, false en caso contrario
    }
}