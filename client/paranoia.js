
var steps = null;
var connection = null;

document.body.onload = function() {
    steps = new StepManager();
    connection = new Connection();
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

        this.stepLoading_Status = document.getElementById('loadingStatus');

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

        this.stepChat_Send.addEventListener('click', this.onButton_StepChat_Send.bind(this) , false);

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
} 

class EFromServer {
    static ERROR        = "er";
    static REGISTER_OK  = "ro";
    static LINK_DATA    = "ld"; 
} 


class Connection
{
    // Servidor STUN público de Google
    configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10 
    }; 

    socketUrl = "wss://paranoia-chat.onrender.com";

    myKey = {
        publicKey: "",
        privateKey: "",
    };

    myData = {
        ip: "",
        port: 0,
        sdp: "",
        ice: [],
        public64: "",
        linkToken: "",
    };
 
    peer = null;
    dataChannel = null;
    startSocket = null
    master = false;
    dataOk = false;
    otherData = null;
 

    connectClientA() {  
        // Crear una conexión RTC
        this.peer = new RTCPeerConnection(this.configuration);

        // Necesitamos manejar el evento 'icecandidate' para obtener la IP pública
        this.peer.onicecandidate = (event) => {
            const res = this.saveDataFromIceCandidate(event);
            if (res) this.socketRegister();
        };

        // Crear una oferta (esto iniciará el proceso de descubrimiento de ICE)
        this.master = true;
        this.dataChannel = this.peer.createDataChannel("secureChannel");  // Crear un canal de datos vacío

        this.peer.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
        this.dataChannel.onopen = this.onPeerOpen.bind(this); 
        this.dataChannel.onerror = this.onPeerError.bind(this);
        this.dataChannel.onclose = this.onPeerClose.bind(this);
        this.dataChannel.onmessage = this.onPeerMessage.bind(this);

        this.peer.createOffer()
        .then((offer) => {
            console.log("createOffer", offer);
            this.myData.sdp = JSON.stringify(offer);
            steps.showLoading("Establishing connection...");
            return this.peer.setLocalDescription(offer);
        })
        .catch(console.error);
    } 

    connectClientB() {   
        (async () => {   
            await this.readOtherData(steps.stepJoin_Pass.value, steps.stepJoin_Data.value);
            this.myData.linkToken = this.otherData.linkToken;
 
            // Crear una conexión RTC
            this.peer = new RTCPeerConnection(this.configuration);

            // Necesitamos manejar el evento 'icecandidate' para obtener la IP pública
            this.peer.onicecandidate = (event) => {
                const res = this.saveDataFromIceCandidate(event); 
                if (res) this.socketLink();
            };

            // Escuchar la creación del canal de datos
            this.peer.ondatachannel = (event) => {
                console.log("ondatachannel", event);

                this.dataChannel = event.channel;  
                this.peer.oniceconnectionstatechange    = this.onIceConnectionStateChange.bind(this); 
                this.dataChannel.onmessage              = this.onPeerMessage.bind(this);
                this.dataChannel.onerror                = this.onPeerError.bind(this);
                this.dataChannel.onclose                = this.onPeerClose.bind(this);
                this.dataChannel.onopen                 = this.onPeerOpen.bind(this); 
            };

            // Agregar la oferta de Peer A 
            this.peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(this.otherData.sdp)));
            this.otherData.ice.forEach(ice => {
                this.peer.addIceCandidate(JSON.parse(ice));
            });
             
            // Crear respuesta SDP
            this.peer.createAnswer()
            .then((answer) => { 
                this.myData.sdp = JSON.stringify(answer);
                steps.showLoading("Establishing connection...");
                return this.peer.setLocalDescription(answer); 
            })
            .catch(console.error);  
        })().catch(console.error);  
    } 

    async encryptMyData(pass) { 
        // Generar par de claves
        this.myKey = await UtilsAsymetric.generateKeyPair();
        console.log(this.myKey);
        this.myData.public64 = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);

        console.log('send data:', this.myData);
        const raw = JSON.stringify(this.myData);

        // Derivar clave
        const salt = (new Date()).toLocaleString();
        const key = await Utils.deriveKey(pass, salt); 

        // Cifrar texto
        const { ciphertext, iv } = await Utils.encryptText(key, raw);
        const res = btoa(iv) + ":" + btoa(salt) + ":" + Utils.bytesToHex(ciphertext);

        return res;
    }

    async readOtherData(pass, dataString) {
         
        //parse other data  
        const parts         = dataString.split(":");
        const iv            = new Uint8Array(atob(parts[0]).split(","));
        const salt          = atob(parts[1]);
        const ciphertext    = Utils.hexToBytes(parts[2]);

        // Derivar clave 
        const key = await Utils.deriveKey(pass, salt);

        // Descifrar texto
        const textoDescifrado = await Utils.decryptText(key, ciphertext, iv); 
        this.otherData = JSON.parse(textoDescifrado);

        console.log('Texto descifrado:', this.otherData);  
    }

    onRegisterOk(token)
    {
        (async () => {   
            this.myData.linkToken = token;
 
            const res = await this.encryptMyData(steps.stepNew_Pass.value);
            console.log('Texto cifrado:', res);  

            steps.showLoading("Waiting for client B..."); 
        })().catch(console.error); 
    }

    onLinkData(data)
    {
        (async () => {   
            steps.showLoading("Waiting for connection..."); 
            await this.readOtherData(steps.stepNew_Pass.value, data);
            steps.stepNew_Pass.value = "";

            this.peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(this.otherData.sdp)));
            this.otherData.ice.forEach(ice => {
                this.peer.addIceCandidate(JSON.parse(ice));
            }); 
        })().catch(console.error); 
    }

    sendPeerMessage(text) { 
        (async () => {   
            // Cifrar con clave pública 
            const publicCryptoA = await UtilsAsymetric.importPublicKey(this.otherData.public64);
            const encryptedData = await UtilsAsymetric.encryptWithPublicKey(publicCryptoA, text);
            const hex = Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log("Texto Cifrado (Hex):", hex);
            this.dataChannel.send(hex);
        })().catch(console.error);     
    }

 
    //WEB RTC
    onPeerOpen(event) {
        console.log("Canal abierto, listo para enviar mensajes.");
        console.log(event);
        steps.showChat();
        this.startSocket.close();
        this.stepChat_Status.innerHTML = "Connected"; 
    } 

    onPeerClose() {
        console.log("Canal cerrado");
        this.stepChat_Status.innerHTML = "Disconnected"; 
    } 

    onPeerError(error) {
        console.log("error", error);
        this.stepChat_Status.innerHTML = "Error"; 
    } 

    onIceConnectionStateChange(event) {
        console.log("Estado ICE:", this.peer.iceConnectionState, event);
        if (this.peer.iceConnectionState === "connected") {
            console.log("Conexión establecida!");
        }
    } 

    onPeerMessage(event) {
        console.log("Mensaje recibido:", event);
        (async () => {   
            // Descifrar con clave privada 
            const decryptedData = await UtilsAsymetric.decryptWithPrivateKey(this.myKey.privateKey, Utils.hexToBytes(event.data));
            console.log("Texto Descifrado:", decryptedData);

            steps.addMessage(false, decryptedData)
        })().catch(console.error);  
    } 

    saveDataFromIceCandidate(iceEvent) {
        console.log("onicecandidate", iceEvent);
        if (iceEvent.candidate != null) {   
            this.myData.ice.push(JSON.stringify(iceEvent.candidate));
            if (!this.dataOk) {  
                // Extraer la IP pública y el puerto
                const candidate = iceEvent.candidate.candidate;
                const match = candidate.match(/candidate:(\d+) (\d+) (\w+) (\d+) (\d+\.\d+\.\d+\.\d+) (\d+) typ (\w+)(?: raddr (\d+\.\d+\.\d+\.\d+))?(?: rport (\d+))?/); 
				 
                if (match) { 
					const ip = match[5];
					const port = match[6];

					if (!Utils.isLocalIp(ip)) {
						this.myData.ip      = ip;
						this.myData.port    = port; 
						this.dataOk = true; 
	
						console.log("candidate OK!");  
					} 
                }
            }  
        }
        else {
            return true;
        }

        return false;
    }

     
    //SOCKET
    initSocket(callback = null) {

        steps.showLoading("Signaling...");

        this.startSocket = new WebSocket(this.socketUrl);

        this.startSocket.onopen = () => {
          console.log("Connection established with the server"); 
          if (callback != null) callback();  
        };
        
        this.startSocket.onmessage = this.onSocketMessage.bind(this);
        this.startSocket.onerror = this.onSocketError.bind(this); 
        this.startSocket.onclose = this.onSocketClose.bind(this);
    }

    socketRegister() {
        this.initSocket( () => {
            this.startSocket.send(JSON.stringify({type: EToServer.REGISTER}));
        });
    }

    socketLink() {
        this.initSocket( () => {
            (async () => {   
                const linkToken = this.otherData.linkToken;
                const myEncripted = await this.encryptMyData(steps.stepJoin_Pass.value);
                steps.stepJoin_Pass.value = "";
                this.startSocket.send(JSON.stringify({type: EToServer.LINK, payload: {token: linkToken, data: myEncripted} })); 
            })().catch(console.error);  
        });
    }

    onSocketMessage(event) {
        const data = JSON.parse(event.data);

        if (data.status === EFromServer.REGISTER_OK) {
            console.log("Registration successful. Token:", data.token);
            this.onRegisterOk(data.token);
        } else if (data.status === EFromServer.LINK_DATA) {
            console.log("Link successful. data:", data.data);
            this.onLinkData(data.data);
        } else if (data.status === EFromServer.ERROR) {
            console.log("Error. message:", data.message);
        } else {
            console.log("Message unknown received:", data);
        }
    }

    onSocketError(err) {
        console.error("Socket error", err);
    }

    onSocketClose() {
        console.log("Socket closed");
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
}