var steps       = null;
var connection  = null;
var demo        = null;

document.body.onload = function() {
    connection = new Connection();
    steps = new StepManager();   

    steps.showStepStart(); 
};

class StepManager
{
    constructor() {
 
        // elements
        this.containerStepStart = document.getElementById('step1');
        this.containerStepNew = document.getElementById('step2New');
        this.containerSettings = document.getElementById('settings'); 
        this.containerEsteganography = document.getElementById('esteganography'); 
        this.containerLoading = document.getElementById('loading'); 
        this.containerError = document.getElementById('error'); 
        this.containerChat = document.getElementById('chat'); 

        this.stepHeader_Esteganography  = document.getElementById('headerEsteganography'); 
        this.stepHeader_Settings  = document.getElementById('headerSettings'); 
        this.stepHeader_Burn  = document.getElementById('headerBurn'); 

        this.stepStart_New = document.getElementById('newConnection');

        this.stepNew_Pass = document.getElementById('newPassword'); 
        this.stepNew_Generate = document.getElementById('generateConnection');

        this.stepLoading_Spinner = document.getElementById('loadingSpinner');
        this.stepLoading_Status = document.getElementById('loadingStatus');

        this.stepSettings_Server = document.getElementById('settingsServer');
        this.stepSettings_Reset = document.getElementById('settingsReset');
        this.stepSettings_Exit = document.getElementById('settingsExit');
        this.stepSettings_CleanOnHide = document.getElementById('settingsCleanOnHide');

        this.stepEsteganography_Decode = document.getElementById('esteganographyDecode');
        this.stepEsteganography_Encode = document.getElementById('esteganographyEncode');
        this.stepEsteganography_Exit = document.getElementById('esteganographyExit');
        
        this.stepEsteganography_DecodeImage = document.getElementById('esteganographyDecodeImage');
        this.stepEsteganography_DecodeResult = document.getElementById('esteganographyDecodeResult');
        this.stepEsteganography_EncodeResultBox = document.getElementById('esteganographyEncodeResultBox'); 
        this.stepEsteganography_EncodeImage = document.getElementById('esteganographyEncodeImage');
        this.stepEsteganography_EncodeText = document.getElementById('esteganographyEncodeText'); 
        this.stepEsteganography_EncodeResult = document.getElementById('esteganographyEncodeResult');
        this.stepEsteganography_EncodeDownload = document.getElementById('esteganographyEncodeDownload');
        
        this.stepError_Restart = document.getElementById('errorRestart');
        this.stepError_Text = document.getElementById('errorText');

        this.stepChat_Status = document.getElementById('chatStatus');
        this.stepChat_Content  = document.getElementById('chatContent');
        this.stepChat_Text  = document.getElementById('chatText'); 
        this.stepChat_Send  = document.getElementById('chatSend');  

        // listeners
        this.stepHeader_Burn.addEventListener('click', this.onButton_StepHeader_Burn.bind(this) , false);
        this.stepHeader_Settings.addEventListener('click', this.onButton_StepHeader_Settings.bind(this) , false);
        this.stepHeader_Esteganography.addEventListener('click', this.onButton_StepHeader_Esteganography.bind(this) , false);
        
        this.stepStart_New.addEventListener('click', this.onButton_StepStart_New.bind(this) , false);
        this.stepNew_Generate.addEventListener('click', this.onButton_StepNew_Generate.bind(this) , false);
        
        this.stepSettings_Reset.addEventListener('click', this.onButton_StepSettings_Restart.bind(this) , false);
        this.stepSettings_Exit.addEventListener('click', this.onButton_StepSettings_Exit.bind(this) , false);
        this.stepError_Restart.addEventListener('click', this.onButton_StepError_Restart.bind(this) , false);  

        this.stepEsteganography_Decode.addEventListener('click', this.onButton_StepEsteganography_Decode.bind(this) , false);
        this.stepEsteganography_Encode.addEventListener('click', this.onButton_StepEsteganography_Encode.bind(this) , false);
        this.stepEsteganography_Exit.addEventListener('click', this.onButton_StepEsteganography_Exit.bind(this) , false);
        
        this.stepChat_Send.addEventListener('click', this.onButton_StepChat_Send.bind(this) , false);
        this.stepChat_Text.addEventListener('input', () => {
            // Reset the height to recalculate
            this.stepChat_Text.style.height = 'auto';

            // Adjust the height automatically according to the content
            this.stepChat_Text.style.height = `${Math.min(this.stepChat_Text.scrollHeight, parseInt(getComputedStyle(this.stepChat_Text).lineHeight) * 4)}px`;
        });  

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onVisibilityChange(false);
            } else {
                this.onVisibilityChange(true);
            } 
        });
         
        // Prepare data
        this.stepChat_Status.innerHTML = "Connecting..."; 
        this.stepChat_Content.innerHTML = ""; 

        this.stepSettings_Server.value = connection.socketUrl;
    }  
 
    hideAll() { 
        Utils.addClass(this.containerStepStart, 'hide'); 
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerSettings, 'hide');
        Utils.addClass(this.containerEsteganography, 'hide'); 
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 
    }
  
    showStepStart() {
        this.hideAll();
        Utils.removeClass(this.containerStepStart, 'hide'); 

        this.stepChat_Status.innerHTML = "Ready to connect"; 
    }

    showStepNew() {
        this.hideAll();
        Utils.removeClass(this.containerStepNew, 'hide'); 

        this.stepNew_Pass.focus();
    }

    showSettings() { 
        this.hideAll();
        Utils.removeClass(this.containerSettings, 'hide'); 
    }

    showEsteganography() { 
        this.hideAll();
        Utils.removeClass(this.containerEsteganography, 'hide'); 
    }

    showLoading(status = '') {
        this.hideAll();
        Utils.removeClass(this.containerLoading, 'hide'); 

        if (status == '')   this.stepLoading_Status.innerHTML = "Loading...";
        else                this.stepLoading_Status.innerHTML = status;
 
        Utils.removeClass(this.stepLoading_Spinner, 'hide');
        Utils.addClass(this.stepLoading_CopyContainer, 'hide');
        Utils.addClass(this.stepLoading_CopyLabel1, 'hide');
        Utils.addClass(this.stepLoading_CopyLabel2, 'hide');

        console.warn("Show Loading: " + status);
    } 

    showError(text = '') { 
        this.hideAll();
        Utils.removeClass(this.containerError, 'hide'); 

        if (text == '') this.stepLoading_Status.innerHTML = "Error, try it again!";
        else            this.stepError_Text.innerHTML = text; 

        console.error("Show Error: " + text);
    }

    showChat() { 
        this.hideAll();
        Utils.removeClass(this.containerChat, 'hide'); 

        this.stepChat_Status.innerHTML = "Connected"; 
        this.stepChat_Text.focus();
    }
 
    onButton_StepHeader_Esteganography() {
        this.showEsteganography();
    }

    onButton_StepHeader_Settings() {
        this.showSettings();
    }
 
    onButton_StepHeader_Burn() {
        connection.burn();
    }

    onButton_StepStart_New() {
        if (demo != null)   demo.demoStart();
        else                connection.initialServerPing(); 
    }

    onButton_StepNew_Generate() {
        this.showLoading(); 
        this.stepChat_Status.innerHTML = "Connecting..."; 
        connection.linkClient();
    }

    onButton_StepError_Restart() {
        if (connection.socket != null) connection.socket.close();
        this.showLoading("Restart..."); 
        steps.stepNew_Pass.value = "";
        steps.showStepStart(); 
    } 

    onButton_StepSettings_Restart() {
        connection.burn(); 
    }

    onButton_StepSettings_Exit() {
        if (connection.success) {
            this.showChat();
        }
        else {
            this.showStepStart();
        }
    } 
 
    onButton_StepEsteganography_Decode() {
        Esteganography.getPixelsFromImage(this.stepEsteganography_DecodeImage, (pixels) => {
            if (pixels == null) return;

            const message = Esteganography.extractMessage(pixels);
            this.stepEsteganography_DecodeResult.innerText = message;
        }); 
    }

    onButton_StepEsteganography_Encode() {
        const message = this.stepEsteganography_EncodeText.value;

        const passCheck = Utils.checkPassword(message);
        if (!passCheck.success) {
            steps.showError(passCheck.message);
            return false;
        }

        Esteganography.insertMessageInHtmlImage(this.stepEsteganography_EncodeImage, message, this.stepEsteganography_EncodeResult, this.stepEsteganography_EncodeDownload); 
        Utils.removeClass(this.stepEsteganography_EncodeResultBox, "hide");
    }

    onButton_StepEsteganography_Exit() {
        this.showStepStart();
    }
   
    onButton_StepChat_Send() {
        const text = this.stepChat_Text.value;
        this.stepChat_Text.value = ""; 

        connection.sendChatMessage(text);
        this.addMessage(true, text); 
    } 

    addMessage(isMine, text) {
        const ele = document.createElement("div");
        Utils.addClass(ele, ["message", isMine ? "sent" : "received"]);
        ele.innerText = text;
        this.stepChat_Content.append(ele);
        this.stepChat_Content.scrollTop = this.stepChat_Content.scrollHeight;
    }

    onVisibilityChange(visibility) {
        if (!visibility) {
            if (this.stepSettings_CleanOnHide.checked) {
                document.querySelectorAll(".message").forEach(e => {
                    e.innerHTML = "...";
                });
            }
        }
    } 
}
 
class Connection
{  
    socketUrl               = "ws://localhost:8080";
    //socketUrl             = "wss://paranoia-chat.onrender.com";
    socket                  = null;
    sessionToken            = "";
    meHandshakeInitiator    = false;
    success                 = false;

    linkKey = { publicKey: "", privateKey: "", public64: "" };   
    myKey   = { publicKey: "", privateKey: "", public64: "" };  

    otherPublicKey      = null;   
    serverEncrypt64     = "";
    serverEncryptKey    = null;
    serverSign64        = "";
    serverSignKey       = null;

    initialServerPing()
    {
        steps.showLoading("Connecting to server, please wait...");
        this.initSocket.bind(this)( () => { 
            (async () => {    
                steps.showLoading("Signaling... Ok");  
                await this.registerClient();
            })().catch(console.error);  
        });
    }

    async registerClient() { 
        steps.showLoading("Register...");   
        this.socket.send(JSON.stringify({type: EToServer.REGISTER})); 
    }

    async linkClient() {  

        steps.showLoading("Connecting..."); 
        const pass = steps.stepNew_Pass.value;
 
        const passCheck = Utils.checkPassword(pass);
        if (!passCheck.success) {
            steps.showError(passCheck.message);
            return; 
        } 

        this.sessionToken = await Utils.deriveSessionToken(pass);
        
        // Generate key pair
        this.linkKey            = await UtilsAsymetric.generateKeyPair();
        this.linkKey.public64   = await UtilsAsymetric.exportPublicKey(this.linkKey.publicKey);
        this.myKey              = await UtilsAsymetric.generateKeyPair();
        this.myKey.public64     = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);

        this.socket.send(JSON.stringify({type: EToServer.LINK, key: this.linkKey.public64, token: this.sessionToken}));  
    } 
 
    sendHandshake() { 
        steps.showLoading("Handshake...");
        (async () => {    
            const pass = steps.stepNew_Pass.value;
            const sendData = {
                key:    await Utils.encryptSymetricData(this.myKey.public64, pass),
                token:  this.sessionToken
            } 

            const send2  = await UtilsAsymetric.hybridEncrypt(this.serverEncryptKey, sendData);  
            send2.type   = EToServer.HANDSHAKE;

            this.socket.send(JSON.stringify(send2));
        })().catch(console.error);      
    }
    
    sendChatMessage(text) {  
        (async () => {    
            const send   = await UtilsAsymetric.hybridEncrypt(this.otherPublicKey, text);
            send.token   = this.sessionToken; 

            const send2  = await UtilsAsymetric.hybridEncrypt(this.serverEncryptKey, send);  
            send2.type   = EToServer.MESSAGE;

            this.socket.send(JSON.stringify(send2));
        })().catch(console.error);     
    }
 
    async onRegisterOk()
    {   
        steps.showLoading("Register OK!");  
        steps.stepChat_Status.innerHTML = "Waiting for key phrase..."; 
        steps.showStepNew();
    }

    async onLinkOk(linkData)
    {  
        this.serverEncrypt64    = linkData.encryptKey;
        this.serverEncryptKey    = await UtilsAsymetric.importPublicKey(this.serverEncrypt64);
        this.serverSign64       = linkData.signKey;
        this.serverSignKey      = await UtilsAsymetric.importPublicSignKey(this.serverSign64);

        if (linkData.complete == 1) {
            steps.showLoading("Connecting OK!"); 
            this.meHandshakeInitiator = true;
            this.sendHandshake();
        }
        else {
            steps.showLoading("Waiting for other..."); 
        }
    }

    async onHandshakeData(handshakeData)
    { 
        const pass = steps.stepNew_Pass.value;
        const otherData = await Utils.readSymetricData(pass, handshakeData.key); 
        this.otherPublicKey = await UtilsAsymetric.importPublicKey(otherData);

        steps.showLoading("Handshake OK!");

        if (this.meHandshakeInitiator) {
            this.success = true;
            steps.stepNew_Pass.value = "";
            steps.showChat();  
        }
        else {
            this.sendHandshake();

            this.success = true;
            steps.stepNew_Pass.value = "";
            steps.showChat();  
        }
    }
 
    async onChatMessage(message) { 
        steps.addMessage(false, message);
    } 
 
    burn()
    {
        const eraseString  = "XXXXXXXXXXX";

        steps.stepNew_Pass.value        = "";
 
        this.linkKey.privateKey = eraseString;
        this.linkKey.publicKey  = eraseString;
        this.linkKey.public64   = eraseString; 
        this.myKey.privateKey   = eraseString;
        this.myKey.publicKey    = eraseString;
        this.myKey.public64     = eraseString; 
        this.sessionToken       = eraseString; 
        this.otherPublicKey     = eraseString;   
        this.serverEncrypt64    = eraseString;
        this.serverEncryptKey   = eraseString;
        this.serverSign64       = eraseString;
        this.serverSignKey      = eraseString;
 
        if (this.socket != null) this.socket.close();

        this.success            = false; 
        steps.showError("Connection burned");
    } 
   
    // SOCKET
    initSocket(callback = null) {   
        steps.stepChat_Status.innerHTML = "Connecting..."; 
        const url =  (steps.stepSettings_Server.value == "") ? this.socketUrl: steps.stepSettings_Server.value;
        this.socket = new WebSocket(url); 
        this.socket.onopen = () => {
          console.log("Connection established with the server"); 
          if (callback != null) callback();  
        };
        
        this.socket.onmessage   = this.onSocketMessage.bind(this);
        this.socket.onerror     = this.onSocketError.bind(this); 
        this.socket.onclose     = this.onSocketClose.bind(this); 
    } 
   
    onSocketMessage(event) { 
        (async () => {   
            const data = JSON.parse(event.data);

            if (data.status === EFromServer.ERROR) {
                const errorText = atob(data.result); 
                steps.showError(errorText);
            }
            else
            { 
                const result = JSON.parse(data.result);  
                
                if (data.status === EFromServer.REGISTER_OK) {
                    console.log("Registration successful");
                    await this.onRegisterOk();
                } 
                else if (data.status === EFromServer.LINK_OK) { 
                    const received = await UtilsAsymetric.hybridDecrypt(this.linkKey.privateKey, result);     
                    await this.onLinkOk(received);
                }
                else 
                {
                    // check signature
                    const check = await UtilsAsymetric.verifyWithPublicKey(this.serverSignKey, data.result, Utils.hexToBytes(data.sign));
                    if (!check) {
                        steps.showError("Invalid server signature received");
                    }
                    else {
                        console.log(data.status);
                        if (data.status === EFromServer.HANDSHAKE_DATA) { 
                            await this.onHandshakeData(result);
                        } else if (data.status === EFromServer.MESSAGE) { 
                            const received  = await UtilsAsymetric.hybridDecrypt(this.myKey.privateKey, result);     
                            await this.onChatMessage(received);
                        } else if (data.status === EFromServer.CLOSE) {
                            await this.onChatClose();
                        } else {
                            console.log("Message unknown received:", data);
                            steps.showError("Message unknown received");
                        } 
                    } 
                } 
            }
        })().catch(e => {
            steps.showError("Wrong message format");
            console.error("Message unknown received:", e);
        });  
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