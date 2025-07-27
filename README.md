<h1 align="center">🧠✨ AI Article Summarizer</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-green?style=for-the-badge" alt="status"/>
  <img src="https://img.shields.io/badge/Chrome%20Extension-AI%20Summarizer-blue?style=for-the-badge" alt="chrome extension"/>
  <img src="https://img.shields.io/github/languages/top/night-coders-1/AI-article-summarizer?style=for-the-badge" alt="top language"/>
</p>

<p align="center">
  🚀 A lightweight Chrome extension that uses Google Gemini AI to summarize any article or webpage in seconds!
</p>

<hr/>

## 🔍 Overview

**AI Article Summarizer** is a client‑side Chrome extension that auto‑generates concise, accurate summaries of long articles using the Google Gemini API.  
No backend—your data never leaves your browser!

---

## ✨ Key Features

- 🧠 **AI-Powered Summaries**  
  Instantly condense any article into a few bullet points or a short paragraph.

- 🧩 **Seamless Chrome Integration**  
  Click the toolbar icon to summon the summarizer on any page.

- 🔐 **Custom API Key**  
  Securely paste your own Google Gemini API key in Settings.

- 💎 **Modern, Responsive UI**  
  Built with HTML5, CSS3 & vanilla JavaScript for fast performance.

- 🔒 **Fully Client‑Side**  
  Zero server calls—complete privacy & instant results.

---

## 📁 Repository Structure

```text
AI-article-summarizer/
├── icons/                   # Extension icons (16x16, 48x48, 128x128)
├── popup.html               # Extension popup UI
├── popup.js                 # Main logic: content detection & summarization
├── popup.css                # Styling for the popup
├── background.js            # (Optional) Background tasks, if any
├── manifest.json            # Chrome extension config
├── README.md                # This file
└── .gitignore               # Files & folders to ignore
```

<div align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript" alt="JavaScript"/>
</div>

---

## 🚀 Getting Started

1. **Clone or Download**
    ```bash
    git clone https://github.com/night-coders-1/AI-article-summarizer.git
    cd AI-article-summarizer
    ```
2. **Load in Chrome**
    - Go to `chrome://extensions`
    - Enable "Developer mode"
    - Click "Load unpacked" and select the project folder

---

## 🔧 Configuration

- Click the 🧠 AI Summarizer icon in your Chrome toolbar.
- Click ⚙️ Settings at the bottom of the popup.
- Go to 👉 Google AI Studio to create your Gemini API key.
- Paste the key into the Settings input and click Save.

---

## 🎯 Usage

- Navigate to any article or blog post.
- Click the AI Summarizer icon.
- Wait a second for auto‑detection, then click Summarize.
- View or copy your summary directly from the popup!

<details>
  <summary>💡 Pro Tips</summary>

  - Use ⌨️ <code>Ctrl+Shift+S</code> to open the summary popup quickly.
  - Switch between “Bullet Points” or “Paragraph” mode in Settings.

</details>

---

## 🛠️ Development

```bash
# Watch for changes (if using a bundler / live‑reload setup)
npm install
npm run dev
```
Currently this is a vanilla JS project—no build tools required.

---

## 🤝 Contributing

We love PRs! To contribute:

1. 🍴 Fork this repo
2. 🔧 Create a feature branch (`git checkout -b feature/YourFeature`)
3. ✅ Commit your changes (`git commit -m "Add YourFeature"`)
4. 🔃 Push to your branch (`git push origin feature/YourFeature`)
5. 📩 Open a Pull Request

---

## 📄 License

This project does not yet have a license. Please contact the author for usage terms.

---

## 👨‍💻 Author & Contact

GitHub: [@night-coders-1](https://github.com/night-coders-1)

Repository: [AI-article-summarizer](https://github.com/night-coders-1/AI-article-summarizer)

<p align="center">⭐ If you found this project helpful, please give it a star!</p>
