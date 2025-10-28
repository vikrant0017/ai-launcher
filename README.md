# AI Launcher

A desktop launcher that combines AI chat capabilities, RAG (Retrieval-Augmented Generation) for document querying with local models, and a note capturing

## ✨ Features
### 🤖 AI Chat - Direct conversation with AI using Gemini API
### 📚 RAG Mode (Document Q&A) - Query your personal document collection using natural language (Supports `.md` and `.txt` files)
### 📝 Note - Quickly capture and view notes.  (Notes are saved as markdown)
### ⚡ Quick Access using keyboard shortcuts

## 🚀 Installation

### Prerequisites

**For RAG functionality**
- **[Ollama](https://ollama.com/)** - Required for document embeddings in RAG mode
- Once Ollama is downloaded and installed, run the commands below to pull the required local models
  ```bash
  # Pull the embedding model
  ollama pull nomic-embed-text

  # Pull local LLM
  ollama pull qwen3:1.7b
  ```
### Download and Run
1. **Download the latest release** for your platform from the [GitHub Releases](https://github.com/vikrant0017/ai-launcher/releases) page:
   - `ai-launcher-linux-x64.zip` (Linux)
   - `ai-launcher-darwin-x64.zip` (macOS Intel)
   - `ai-launcher-darwin-arm64.zip` (macOS Apple Silicon)
   - `ai-launcher-win32-x64.zip` (Windows)

2. **Extract the archive**:
3. **Run the application executable**

## ⚙️ Configuration

On first launch, you'll need to configure the application through the Preferences panel.
### Required Configuration
1. **API Key (for AI Chat)**
   - Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Enter it in the Preferences panel
2. **Watch Directory (for RAG)**
   - Set a directory containing your documents (Markdown/text files)
   - The application will automatically index and monitor this directory
3. **Notes Directory (for Notes feature)**
   - Set a directory where your notes will be stored
   - Notes are saved as `fleeting_notes.md`

## 🎮 Usage

### Keyboard Shortcuts

| Shortcut     | Action                 |
| ------------ | ---------------------- |
| `Ctrl+I`     | Switch to AI Chat mode |
| `Ctrl+D`     | Switch to RAG mode     |
| `Ctrl+N`     | Switch to Notes mode   |
| `Ctrl+P`     | Open Preferences       |
| `Ctrl+Enter` | Submit query/note      |
| `Escape`     | Unfocus input field    |
### AI Chat Mode
1. Press `Ctrl+I` to switch to AI mode
2. Type your question in the input field
3. Press `Ctrl+Enter` or click the send button
4. Receive concise, helpful responses
### RAG Mode
1. Configure your watch directory in Preferences
2. Add Markdown or text files to the watch directory
3. Press `Ctrl+D` to switch to RAG mode
4. Ask questions about your documents
### Notes Mode
1. Configure your notes directory in Preferences
2. Press `Ctrl+N` to switch to Notes mode
3. Type your note with optional tags (use `#tag` syntax)
4. Press `Ctrl+Enter` to save
**Browsing notes:**
- Notes are stored in `fleeting_notes.md`
- Each note includes timestamp and unique hash
