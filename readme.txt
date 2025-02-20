# Project Name

## Description

This project enables secure, end-to-end encrypted communication between two users using a shared passphrase. It ensures privacy by leveraging cryptographic techniques to derive session tokens and encryption keys deterministically.

## Purpose

This project is part of an initiative explained on [Instagram @ciberconsulta](https://www.instagram.com/ciberconsulta). The goal is to showcase secure peer-to-peer communication mechanisms and educate users about encryption and privacy best practices.

## Instagram Videos

Below is a list of Instagram videos demonstrating how the system works:

- 🔗 [Video 1: Overview of the project](https://www.instagram.com/yourvideo1)
- 🔗 [Video 2: Secure key exchange](https://www.instagram.com/yourvideo2)
- 🔗 [Video 3: Encrypted messaging demo](https://www.instagram.com/yourvideo3)

## How It Works

1. **User Agreement:** Both users agree on a passphrase consisting of at least three words and a minimum of 16 characters.
2. **Session Token Generation:** The passphrase is used to generate a deterministic session token for server authentication.
3. **Key Exchange:** Public keys are exchanged securely between users through the server.
4. **End-to-End Encryption:** Messages are encrypted using asymmetric encryption and only decrypted by the intended recipient.
5. **Secure Communication:** Once established, users can send and receive encrypted messages securely.

## Features

✅ Secure passphrase-based session generation 
✅ Public-key cryptography (RSA) 
✅ End-to-end encrypted messaging 
✅ Automatic key exchange via the server 
✅ Cross-platform compatibility (browser & Node.js)
✅ Esteganography

## Deploying the Server

To deploy the server, follow these steps:

```bash
# Clone the repository
git clone https://github.com/yourrepo.git
cd yourrepo/server

# Install dependencies
npm install

# Start the server
node server.js
```

## Running the Client (HTML)

To run the client locally:

```bash
cd yourrepo/client

# Open index.html in a browser
```

If using GitHub Pages, you can access it directly via: [GitHub Pages Link](https://yourusername.github.io/yourrepo/)

## Contributing

We welcome contributions! Feel free to submit a pull request or open an issue if you have ideas or find bugs.

## License

This project is licensed under the [MIT License](LICENSE).

