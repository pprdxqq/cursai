# Cursai

Cursai is a Windows-first AI desktop companion built for fast, contextual interaction with your PC.

## Foundation

- Frameless always-on-top companion window
- Global **Ctrl + Space** launcher
- Compact animated Cursai orb
- OpenAI Responses API chat
- Screen/window source discovery
- Cursor-aware ambient interaction
- Collapsible compact mode
- Electron context isolation + preload bridge
- React + TypeScript + Vite frontend
- Windows packaging configuration

## Architecture roadmap

- Voice input/output
- Screen vision and contextual assistance
- Safe PC control with explicit confirmations
- Coding-agent monitoring
- GitHub/project awareness
- Integrations layer
- Persistent local settings and memory
- Windows startup/tray
- Production signing, packaging and updates

## Development

```bash
npm install
npm run dev
```

Create a local `.env` with `OPENAI_API_KEY=...` to enable AI requests.

Cursai uses its own branding, character and UI implementation. Coucou is used as product inspiration only; its reserved character/media assets are not included.
