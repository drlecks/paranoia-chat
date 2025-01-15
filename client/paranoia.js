var steps       = null;
var connection  = null;
var demo        = null;

document.body.onload = function() {
    connection = new Connection();
    steps = new StepManager();   

    if (demo != null)   demo.demoStart();
    else                connection.initialServerPing();
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
        this.stepLoading_CopyLabel1 = document.getElementById('loadingCopyLabel1');
        this.stepLoading_CopyLabel2 = document.getElementById('loadingCopyLabel2');

        this.stepError_Restart = document.getElementById('restart');
        this.stepError_Text = document.getElementById('errorText');

        this.stepChat_Status = document.getElementById('chatStatus');
        this.stepChat_Content  = document.getElementById('chatContent');
        this.stepChat_Text  = document.getElementById('chatText'); 
        this.stepChat_Send  = document.getElementById('chatSend'); 
        this.stepChat_Burn  = document.getElementById('chatBurn'); 

        //listeners
        this.stepStart_New.addEventListener('click', this.onButton_StepStart_New.bind(this) , false);
        this.stepStart_Join.addEventListener('click', this.onButton_StepStart_Join.bind(this) , false);
        this.stepNew_Generate.addEventListener('click', this.onButton_StepNew_Generate.bind(this) , false);
        this.stepJoin_Connect.addEventListener('click', this.onButton_StepJoin_Connect.bind(this) , false);
        this.stepError_Restart.addEventListener('click', this.onButton_StepError_Restart.bind(this) , false);

        this.stepNew_ApiChange.addEventListener('click', () => { Utils.toggleClass(this.stepNew_ApiChange, 'hide'); Utils.toggleClass(this.stepNew_Api, 'hide');} , false);
        this.stepJoin_ApiChange.addEventListener('click', () => { Utils.toggleClass(this.stepJoin_ApiChange, 'hide'); Utils.toggleClass(this.stepJoin_Api, 'hide');} , false);

		this.stepLoading_CopyContainer.addEventListener('click', this.onButton_StepLoading_CopyContainer.bind(this) , false);
		

        
        this.stepChat_Burn.addEventListener('click', this.onButton_StepChat_Burn.bind(this) , false);
        this.stepChat_Send.addEventListener('click', this.onButton_StepChat_Send.bind(this) , false);
		 
        this.stepNew_Api.value = connection.socketUrl;
        this.stepJoin_Api.value = connection.socketUrl;
        this.stepChat_Status.innerHTML = "Hello!"; 
        this.stepChat_Content.innerHTML = ""; 

        this.stepChat_Text.addEventListener('input', () => {
            // Restablece la altura para recalcular
            this.stepChat_Text.style.height = 'auto';

            // Ajusta la altura automáticamente según el contenido
            this.stepChat_Text.style.height = `${Math.min(this.stepChat_Text.scrollHeight, parseInt(getComputedStyle(this.stepChat_Text).lineHeight) * 4)}px`;
        });  
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

        this.stepNew_Pass.focus();
    }

    showStepConnect() {
        Utils.removeClass(this.containerStepJoin, 'hide');

        Utils.addClass(this.containerStepStart, 'hide');
        Utils.addClass(this.containerStepNew, 'hide');
        Utils.addClass(this.containerLoading, 'hide'); 
        Utils.addClass(this.containerError, 'hide');
        Utils.addClass(this.containerChat, 'hide'); 

        this.stepJoin_Data.focus();
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
        Utils.addClass(this.stepLoading_CopyLabel1, 'hide');
        Utils.addClass(this.stepLoading_CopyLabel2, 'hide');
    }

	showLoadingCopy(copyText) {
		this.stepLoading_CopyText.setAttribute('code', copyText);
        this.stepLoading_CopyText.innerText = copyText.substring(0, 12)+"...";

		Utils.addClass(this.stepLoading_Spinner, 'hide');
        Utils.addClass(this.stepLoading_CopyLabel2, 'hide');
        Utils.removeClass(this.stepLoading_CopyLabel1, 'hide');
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

        this.stepChat_Status.innerHTML = "Connected"; 
        this.stepChat_Text.focus();
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
		const code = this.stepLoading_CopyText.getAttribute('code');
		Utils.copyToClipboard(code);
        Utils.removeClass(this.stepLoading_CopyLabel2, 'hide');
	}

    onButton_StepChat_Burn() {
        connection.burn();
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
}
 
class Connection
{  
    socketUrl       = "ws://localhost:8080";
    //socketUrl       = "wss://paranoia-chat.onrender.com";
    socket          = null;
    sessionToken    = "";
    success         = false;

    myKey = {
        publicKey: "",
        privateKey: "",
    }; 
    myPublic64 = ""; 

    otherPublicKey      = null;   
    serverEncrypt64     = "";
    serverEncryptKey    = null;
    serverSign64        = "";
    serverSignKey       = null;


    initialServerPing()
    {
        steps.showLoading("Connecting to server, please wait...");
        this.initSocket.bind(this)( () => { 
            steps.showStepStart();
        });
    }

    connectClientA() {  
        (async () => {    
            const passCheck = Utils.checkPassword(steps.stepNew_Pass.value);
            if (!passCheck) { steps.showError("Weak password"); return; }

            // Generar par de claves
            this.myKey = await UtilsAsymetric.generateKeyPair();
            this.myPublic64 = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);
 
            this.socket.send(JSON.stringify({type: EToServer.REGISTER, key: this.myPublic64}));
            steps.showLoading("Signaling... Ok"); 

        })().catch(console.error);  
    } 

    connectClientB() {   
        (async () => {   
            // Generar par de claves
            this.myKey = await UtilsAsymetric.generateKeyPair(); 
            this.myPublic64 = await UtilsAsymetric.exportPublicKey(this.myKey.publicKey);

            //read first client data
            const firstData         = await Utils.readSymetricData(steps.stepJoin_Pass.value, steps.stepJoin_Data.value); 
            
            if (firstData == null)                  { steps.showError("Read data error 1"); return; }
            if (firstData.sessionToken == null)     { steps.showError("Read data error 2"); return; }
            if (firstData.serverEncrypt64 == null)  { steps.showError("Read data error 3"); return; }
            if (firstData.serverSign64 == null)     { steps.showError("Read data error 4"); return; }

            this.sessionToken       = firstData.sessionToken;
            this.otherPublicKey     = await UtilsAsymetric.importPublicKey(firstData.clientPublic64);
            this.serverEncrypt64    = firstData.serverEncrypt64;
            this.serverEncryptKey   = await UtilsAsymetric.importPublicKey(this.serverEncrypt64);
            this.serverSign64       = firstData.serverSign64;
            this.serverSignKey      = await UtilsAsymetric.importPublicSignKey(this.serverSign64);
 
            //connect  
            const encrypted = await Utils.encryptSymetricData(this.myPublic64, steps.stepJoin_Pass.value);
            steps.stepJoin_Pass.value = "";
            this.sendSocketData(EToServer.LINK, encrypted); 
            this.success = true;
            steps.showChat();  

        })().catch(console.error);  
    } 
 
    sendChatMessage(text) { 
        this.sendSocketData(EToServer.MESSAGE, text);
    }
 
    async onRegisterOk(registerData)
    {  
        this.sessionToken       = registerData.token;
        this.serverEncrypt64    = registerData.encryptKey;
        this.serverEncryptKey    = await UtilsAsymetric.importPublicKey(this.serverEncrypt64);
        this.serverSign64       = registerData.signKey;
        this.serverSignKey      = await UtilsAsymetric.importPublicSignKey(this.serverSign64);

        const sendData = {
            sessionToken:       this.sessionToken,
            clientPublic64:     this.myPublic64,
            serverEncrypt64:    this.serverEncrypt64,
            serverSign64:       this.serverSign64,
        }; 
        const res = await Utils.encryptSymetricData(sendData, steps.stepNew_Pass.value); 

        steps.showLoading("Waiting for client B... <br>Press the code below to copy to clipboard and send it to your other peer"); 
        steps.showLoadingCopy(res); 
    }

    async onLinkData(data)
    { 
        steps.showLoading("Waiting for connection..."); 
        const otherData = await Utils.readSymetricData(steps.stepNew_Pass.value, data); 
        this.otherPublicKey = await UtilsAsymetric.importPublicKey(otherData);
        this.success = true;
        steps.stepNew_Pass.value = "";
        steps.showChat(); 
    }
 
    async onChatMessage(message) { 
        steps.addMessage(false, message);
    } 
 
    burn()
    {
        const eraseString  = "XXXXXXXXXXX";

        steps.stepNew_Pass.value        = "";
        steps.stepJoin_Pass.value       = "";
        steps.stepJoin_Data.value       = "";
 
        this.myKey.privateKey   = eraseString;
        this.myKey.publicKey    = eraseString;
        this.myKey.myPublic64   = eraseString; 
        this.sessionToken       = eraseString;
        this.success            = eraseString; 
        this.otherPublicKey     = eraseString;   
        this.serverEncrypt64    = eraseString;
        this.serverEncryptKey   = eraseString;
        this.serverSign64       = eraseString;
        this.serverSignKey      = eraseString;
 
        this.socket.close();
        steps.showError("Connection burned");
    }

     
    //SOCKET
    initSocket(callback = null) {   
        this.socket = new WebSocket(this.socketUrl); 
        this.socket.onopen = () => {
          console.log("Connection established with the server"); 
          if (callback != null) callback();  
        };
        
        this.socket.onmessage   = this.onSocketMessage.bind(this);
        this.socket.onerror     = this.onSocketError.bind(this); 
        this.socket.onclose     = this.onSocketClose.bind(this);
    } 

    sendSocketData(type, textData) { 
        (async () => {    
            const send   = await UtilsAsymetric.hybridEncrypt(this.otherPublicKey, textData);
            send.token   = this.sessionToken; 

            const send2  = await UtilsAsymetric.hybridEncrypt(this.serverEncryptKey, send);  
            send2.type   = type;

            this.socket.send(JSON.stringify(send2));
        })().catch(console.error);     
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
                const result    = JSON.parse(data.result);  
                const received  = await UtilsAsymetric.hybridDecrypt(this.myKey.privateKey, result);     

                if (data.status === EFromServer.REGISTER_OK) {
                    console.log("Registration successful with token:");
                    await this.onRegisterOk(received);
                } 
                else 
                {
                    //check signature
                    const check = await UtilsAsymetric.verifyWithPublicKey(this.serverSignKey, data.result, Utils.hexToBytes(data.sign));
                    if (!check) {
                        steps.showError("Invalid server signature received");
                    }
                    else {
                        if (data.status === EFromServer.LINK_DATA) {
                            console.log("Link successful");
                            await this.onLinkData(received);
                        } else if (data.status === EFromServer.MESSAGE) {
                            await this.onChatMessage(received);
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
 