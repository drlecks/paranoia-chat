const WebSocket = require('ws');
const crypto = require('crypto');
const { Utils, UtilsAsymetric, EToServer, EFromServer, CommonConfig } = require('../common/common');
 
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });
const doLog = true; 

clog(`WebSocket server running on port ${port}`);
 
class Chat {
    token = '';
    
    client1 = {};
    client2 = {};
}
 
 
// Store registered clients with their tokens
const chats = {};
var clientCont = 0;

function clog(message) {
    if (doLog) console.log(message);
}
function cerror(message) {
    if (doLog) console.error(message);
}

async function returnDataToClient(ws, status, dataText) { 
    const sign = await UtilsAsymetric.signWithPrivateKey(mySignKey.privateKey, dataText);
    ws.send(JSON.stringify({ status: status, sign: Utils.bytesToHex(sign), result: dataText }));
}

async function getAllFromReceived(received) {
    const res = {
        success: true,
        error: '',
        chat: null,
        data: null
    }; 
    res.data = await UtilsAsymetric.hybridDecrypt(myEncryptKey.privateKey, received );  
    
    // Validate the token format
    if (!/^[a-f0-9]{64}$/.test(res.data.token)) {
        res.success = false;
        res.error = 'Invalid token format received';
        cerror(res.data);
        cerror(res.data.token);
    } else if (!chats[res.data.token]) {
        res.success = false;
        res.error = 'Token not found or client disconnected';
    } else {
        res.success = true;
        res.chat = chats[res.data.token];
    } 

    return res;
}

 
var myEncryptKey = {};
var mySignKey = {};
(async () => {
    myEncryptKey        = await UtilsAsymetric.generateKeyPair();
    myEncryptKey.key64  = await UtilsAsymetric.exportPublicKey(myEncryptKey.publicKey);
    mySignKey           = await UtilsAsymetric.generateSignKeyPair();
    mySignKey.key64     = await UtilsAsymetric.exportPublicKey(mySignKey.publicKey);
    clog(`Key generated`);
})().catch(cerror);
  
     
server.on('connection', (ws) => {
    clog('New client connected');

    ws.on('message', (message) => {
        try {
            (async () => { 
                const received  = JSON.parse(message);
                const type      = received.type;

                if (type === EToServer.REGISTER) {  
                    clientCont++;
                    clog(`Client registered ${clientCont}`);
                    await returnDataToClient(ws, EFromServer.REGISTER_OK, 1);
                } else if (type === EToServer.LINK) {

                    const token      = received.token; 
                    if (!chats[token]) {
                        const chat = new Chat();
                        chat.token          = token;
                        chat.client1        = ws;
                        chats[chat.token]   = chat; 

                        const sendData = {
                            encryptKey: myEncryptKey.key64,
                            signKey:    mySignKey.key64,
                            complete:   0
                        }    
                        const clientKey = await UtilsAsymetric.importPublicKey(received.key); 
                        const send      = await UtilsAsymetric.hybridEncrypt(clientKey, sendData)  

                        await returnDataToClient(chat.client1, EFromServer.LINK_OK, JSON.stringify(send));
    
                        clog(`chat generated: ${token}`); 
                    }
                    else {
                        const chat      = chats[token];
                        chat.client2    = ws;

                        const sendData = {
                            encryptKey: myEncryptKey.key64,
                            signKey:    mySignKey.key64,
                            complete:   1
                        }    
                        const clientKey = await UtilsAsymetric.importPublicKey(received.key); 
                        const send      = await UtilsAsymetric.hybridEncrypt(clientKey, sendData)  

                        await returnDataToClient(chat.client2, EFromServer.LINK_OK, JSON.stringify(send));
    
                        clog(`chat completed: ${token}`); 
                    }
                } else if (type === EToServer.HANDSHAKE) {
                    let res = await getAllFromReceived(received);
                    if (!res.success) {
                        await returnDataToClient(ws, EFromServer.ERROR, btoa(res.error));
                        cerror("error: " + res.error); 
                    }
                    else {
                        const sendClient = ws == res.chat.client1 ? res.chat.client2 : res.chat.client1;
                        await returnDataToClient(sendClient, EFromServer.HANDSHAKE_DATA, JSON.stringify(res.data) );
                    } 
                } else if (type === EToServer.MESSAGE) {
                    let res = await getAllFromReceived(received);
                    if (!res.success) {
                        await returnDataToClient(ws, EFromServer.ERROR, btoa(res.error));
                        cerror("error: " + res.error); 
                    }
                    else {
                        const sendClient = ws == res.chat.client1 ? res.chat.client2 : res.chat.client1;
                        await returnDataToClient(sendClient, EFromServer.MESSAGE, JSON.stringify(res.data) );
                    } 
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
                if (chats[key].client2 === ws)
                    chats[key].client2.close(1000, 'Other client disconnected');
                delete chats[key];
                clog(`Client with token ${key} removed`);
            } else if (chats[key].client2 === ws) {
                if (chats[key].client1 === ws)
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
