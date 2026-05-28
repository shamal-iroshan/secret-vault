# Secret Vault

A modern encrypted secret manager built with React, TypeScript, Firebase, and client-side AES encryption.

Secret Vault allows users to securely store:

* passwords
* secret notes
* server credentials
* API keys
* private information

All sensitive data is encrypted in the browser before being stored in Firebase Firestore.

---

# Features

* Client-side AES-GCM encryption
* Separate vault encryption key
* Firebase Authentication
* Per-user isolated storage
* Rich note editor
* Password and secure note support
* Modern shadcn/ui interface
* Responsive design
* Docker support
* TypeScript support
* Firestore security rules

---

# Security Model

Secret Vault uses a two-layer protection model.

## 1. Firebase Authentication

Users authenticate using Firebase email/password authentication.

## 2. Vault Encryption Key

After login, users must provide a separate encryption/decryption key.

This key:

* never leaves the browser
* is never stored in Firebase
* is used to derive an AES-256 encryption key
* encrypts all secrets before database storage

Firestore only stores encrypted ciphertext.

---

# Tech Stack

* React
* TypeScript
* Vite
* Firebase Authentication
* Firebase Firestore
* TipTap Editor
* Tailwind CSS
* shadcn/ui
* Docker
* Nginx

---

# Screenshots

Add screenshots here.

```md
![Login](./screenshots/login.png)
![Dashboard](./screenshots/dashboard.png)
![Editor](./screenshots/editor.png)
```

---

# Installation

## Clone repository

```bash
git clone https://github.com/your-username/secret-vault.git

cd secret-vault
```

## Install dependencies

```bash
npm install
```

---

# Environment Variables

Create:

```txt
.env
```

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

---

# Firebase Setup

## Enable Authentication

Firebase Console → Authentication → Sign-in method

Enable:

* Email/Password

## Create Firestore Database

Enable Firestore Database.

## Firestore Rules

Use these rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write:
        if request.auth != null
        && request.auth.uid == userId;

      match /vault/{itemId} {
        allow read, write, delete:
          if request.auth != null
          && request.auth.uid == userId;
      }
    }
  }
}
```

---

# Run Development Server

```bash
npm run dev
```

---

# Docker Deployment

## Build image

```bash
docker build -t secret-vault .
```

## Run container

```bash
docker run -d \
  --name secret-vault \
  -p 8080:80 \
  --restart unless-stopped \
  secret-vault
```

Open:

```txt
http://localhost:8080
```

---

# Docker Compose

```yaml
services:
  secret-vault:
    build: .
    container_name: secret-vault
    restart: unless-stopped
    ports:
      - "8080:80"
```

Run:

```bash
docker compose up -d --build
```

---

# Project Structure

```txt
src/
 ├─ components/
 ├─ pages/
 ├─ lib/
 ├─ types/
 ├─ App.tsx
```

---

# Supported Note Features

The rich note editor supports:

* headings
* bold text
* italic text
* ordered lists
* unordered lists
* paragraphs

Notes are stored as encrypted HTML.

---

# Important Security Notes

* Vault encryption keys are never stored in Firebase.
* If the vault key is forgotten, encrypted data cannot be recovered.
* Firebase configuration values are public by design.
* Security depends on:

  * Firebase Authentication
  * Firestore Rules
  * Client-side encryption
  * Strong vault keys

---

# Recommended Future Improvements

* Two-factor authentication
* Auto-lock vault
* Password generator
* Clipboard auto-clear
* Offline support
* Encrypted file attachments
* Password health checker
* Import/export backups
* Categories and tags

---

# License

MIT License

---

# Disclaimer

This project is intended for educational and personal-use purposes.

Before using in production:

* review the code carefully
* perform a security audit
* verify Firebase security rules
* understand the encryption model
* use HTTPS only
