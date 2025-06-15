# 🎥 VidMeet — A Real-Time Video Conferencing App

VidMeet is a full-stack WebRTC-powered video conferencing platform built with the MERN stack, Socket.IO, and React. It supports real-time audio/video calling, screen sharing, chat, and more — all in the browser.

## 🚀 Features

* 🔒 Secure peer-to-peer (P2P) video calls using **WebRTC**
* 💬 Real-time messaging with **Socket.IO**
* 🖥️ Screen sharing support
* 📱 Works across **laptops and mobile browsers**
* 👥 Unique room code generation for private calls
* 🎨 Responsive and modern UI using **TailwindCSS**
* 🌗 Dark mode support
* 🌍 Hosted:

  * **Frontend on Vercel**
  * **Backend on Render**

## 🧱 Tech Stack

| Frontend           | Backend           | Others                    |
| ------------------ | ----------------- | ------------------------- |
| React + TypeScript | Node.js + Express | Socket.IO                 |
| Vite               | REST API          | WebRTC (Media APIs)       |
| Tailwind CSS       | CORS, dotenv      | Render (Hosting)          |
| Zustand / Context  |                   | Vercel (Frontend Hosting) |

## 🌐 Live Demo

* 🔗 **Frontend (Vercel)**: [https://vidmeet-frontend.vercel.app](https://vidmeet-frontend.vercel.app)
* 🔗 **Backend (Render)**: [https://vidmeet-backend.onrender.com](https://vidmeet-backend.onrender.com)

## 📂 Project Structure

```
Video_Conferencing/
├── Client/                 # React frontend (Vite + TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── index.html
│   ├── .env
│   └── vite.config.ts
├── Server/                 # Node.js + Socket.IO backend
│   ├── index.js
│   └── .env
├── .gitignore
├── README.md
```

## 🛠️ Installation & Running Locally

### Prerequisites

* Node.js & npm installed

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VidMeet.git
cd VidMeet
```

### 2. Setup the Backend (Server)

```bash
cd Server
npm install
npm start
```

* The backend will run on `http://localhost:8000`

> ✅ Create a `.env` in the Server folder if needed:
>
> ```
> PORT=8000
> ```

### 3. Setup the Frontend (Client)

```bash
cd ../Client
npm install
npm run dev
```

* The frontend will run on `http://localhost:5173`

> 🔧 Make sure to configure the backend URL in your frontend’s `SocketProvider.tsx`:
>
> ```ts
> const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL), []);
> ```
>
> And in `.env`:
>
> ```
> VITE_SERVER_URL=https://vidmeet-backend.onrender.com
> ```

## 📦 Build for Production

To build the frontend for Vercel:

```bash
cd Client
npm run build
```

This generates the `/dist` folder which Vercel uses.

## 🧪 Future Enhancements

* ✅ Authentication & user profiles
* ✅ Raise hand / mute all features
* ✅ Recording calls
* ✅ Persistent chat history via database
* ✅ UI notifications and alerts

## 🧑‍💻 Author

* Developed with ❤️ by **Joydeep Hans**
* Connect on [LinkedIn](https://www.linkedin.com/in/joydeephans/)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
