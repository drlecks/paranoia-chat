# 🛡️ Paranoia Chat

## 📖 Description

This project enables secure, end-to-end encrypted communication between two users using a shared passphrase. It ensures privacy by leveraging cryptographic techniques to derive session tokens and encryption keys deterministically.

## 🎯 Purpose

This project is part of an initiative explained on [Instagram @ciberconsulta](https://www.instagram.com/ciberconsulta). The goal is to showcase secure peer-to-peer communication mechanisms and educate users about encryption and privacy best practices.

## 🎥 Instagram Videos

Below is a list of Instagram videos demonstrating how the system works (Spanish):

- 🔗 [Part 1. The 3 Laws](https://www.instagram.com/ciberconsulta/reel/DE-6MDaMYMC/)
- 🔗 [Part 2. The Base](https://www.instagram.com/ciberconsulta/reel/DFssPwdMnU_/)
- 🔗 [Part 3. Communication Flow](https://www.instagram.com/ciberconsulta/reel/DGD24gmsXe3/)

## 🔍 How It Works

1. **User Agreement:** Both users agree on a passphrase consisting of at least three words and a minimum of 16 characters.
2. **Session Token Generation:** The passphrase is used to generate a deterministic session token for server authentication.
3. **Key Exchange:** Public keys are exchanged securely between users through the server.
4. **End-to-End Encryption:** Messages are encrypted using asymmetric encryption and only decrypted by the intended recipient.
5. **Secure Communication:** Once established, users can send and receive encrypted messages securely.

## 🚀 Features

✅ Secure passphrase-based session generation 

✅ Public-key cryptography (RSA) 

✅ End-to-end encrypted messaging 

✅ Automatic key exchange via the server 

✅ Cross-platform compatibility (browser & Node.js)

✅ Esteganography

## 🖥️ Deploying the Server

To deploy the server locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/drlecks/paranoia-chat.git
cd paranoia-chat/server

# Install dependencies
npm install

# Start the server
node server.js
```

Also you can deploy the server on services like Render with this data:
```bash
 Repository: https://github.com/drlecks/paranoia-chat
 Branch: main
 Root directory: server
 Build command: npm install
 Start command: npm start
```
## 🌐 Running the Client (HTML)

To run the client locally:

```bash
cd paranoia-chat/client-html

# Open index.html in a browser
```
  
## 🤝 Contributing

We welcome contributions! Feel free to submit a pull request or open an issue if you have ideas or find bugs.

## 🛠️ Bug Bounty Rules

We appreciate security research and responsible disclosure. However, please adhere to the following rules: 

- Do not tamper with or access any personal accounts, including my GitHub account or any private data. 
- Do not attack the public test server. If you need to test exploits, please set up your own local instance. 
- No financial rewards: Since this is a non-commercial project, there will be no monetary compensation for findings. 
- Recognition: Valid security findings will be listed in the Hunters Hall of Fame section as a token of appreciation.

If you find a vulnerability, please report it responsibly by opening an issue or contacting us privately.

## 🏆 Hunters Hall of Fame

1. [drlecks](https://github.com/drlecks) Project creator
   
The Hunters Hall of Fame is a recognition board for security researchers and contributors who responsibly disclose vulnerabilities in the project. Since this is a non-commercial initiative, there are no financial rewards, but your efforts will be publicly acknowledged here.

To earn a spot in the Hall of Fame:

1. Find a valid security issue following the Bug Bounty Rules.
2. Report it responsibly via an issue or private contact.
3. Have your finding verified and confirmed as a legitimate vulnerability.

Once verified, your name (or alias) will be listed here as a Hall of Fame Hunter 🏅 along with a brief description of your contribution. 
We appreciate your efforts in making this project more secure! 🚀

## 📜 License

This project is licensed under the [MIT License](LICENSE).

