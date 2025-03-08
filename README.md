# 🃏 **Uno Game**  
Ce projet est une implémentation du jeu **UNO** construit avec **Colyseus** (pour la gestion des serveurs de jeux en temps réel) et **Angular** (pour le frontend).  

---

## 🚀 **Fonctionnalités**  
### 🎮 **Backend (Colyseus)**  
- Gestion des parties en temps réel avec Colyseus  
- État du jeu géré par `MyRoomState.ts`  
- Logique du jeu définie dans `MyRoom.ts`  
- Synchronisation des états entre le serveur et le client  

### 🖥️ **Frontend (Angular)**  
- Interface utilisateur construite avec Angular  
- **Composants** :  
  - `HomeComponent` – Page d'accueil  
  - `GameComponent` – Interface du jeu  
- Service API (`api.service.ts`) pour la gestion des communications  

---

## 🛠️ **Technologies utilisées**  
✅ **Colyseus** – Gestion des jeux multijoueurs en temps réel  
✅ **Angular** – Framework frontend  
✅ **TypeScript** – Langage principal  
✅ **HTML/CSS** – Interface utilisateur  

---

## 📥 **Installation**  

### **1. Cloner le dépôt**  
```bash
git clone https://github.com/votre-utilisateur/unoGame.git
```

### 2. **Installer les dépendances**
Backend :

```bash
cd backend
npm install
```
Frontend :

```bash

cd frontend
npm install
```
## 3. **Lancer le projet**
Backend :

```bash

npm run start
```
Frontend :

```bash
ng serve
```
---
## ✅ **Utilisation**
- Lancez le serveur backend Colyseus
- Ouvrez le navigateur à l'adresse http://localhost:4200
- Rejoignez une partie et commencez à jouer !
---
## 📂 **Structure du Projet**
```text

├── backend
│   ├── src
│   │   ├── MyRoom.ts
│   │   ├── MyRoomState.ts
│   └── index.ts
├── frontend
│   ├── src
│   │   ├── app
│   │   │   ├── components
│   │   │   │   ├── home
│   │   │   │   └── game
│   │   │   ├── services
│   │   │   │   └── api.service.ts
├── README.md

```
---

## 🏆 **Améliorations Futures**
✅ Améliorer la gestion des erreurs en temps réel
✅ Ajouter des animations et effets sonores
✅ Implémenter un mode spectateur Request

---

## 🪪 **Licence**
Ce projet est sous licence MIT – voir le fichier LICENSE pour plus de détails.

---

## 🔗 **Suivi du travail (Day-by-Day)**
Vous pouvez suivre le travail au jour le jour sur le dépôt GitLab en suivant ce lien :  
➡️ [Voir le suivi sur GitLab](https://gitlab.com/groupe-uno)
