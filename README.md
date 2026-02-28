# 🛡️ VulnScan

A modern security vulnerability scanner with a cyberpunk-themed dashboard. Scan Git repositories, uploaded files, or pasted code for security issues using multiple detection engines.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-green.svg)

## ✨ Features

- **🔍 Multiple Scan Sources**
  - Git repositories (auto-clone)
  - File uploads (source files & archives)
  - Direct code paste

- **🛠️ Detection Engines**
  - Semgrep (static analysis)
  - Secret detection (API keys, tokens)
  - Dependency vulnerability scanning

- **⚡ Async Processing**
  - Background workers via Redis
  - Real-time scan progress
  - PostgreSQL for persistence

- **🎨 Cyberpunk UI**
  - Dark theme with cyan accents
  - Space Mono + Syne typography
  - CRT scanline effects
  - Real-time updates

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Run
```bash
git clone https://github.com/vector81/vulnscan.git
cd vulnscan
docker compose up
```

Then open:
- 🌐 **Dashboard**: http://localhost:3000
- 📚 **API Docs**: http://localhost:8000/docs

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  FastAPI     │────▶│  PostgreSQL │
│  Frontend   │     │   Backend    │     │   Database  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │    Redis     │
                    │   Queue      │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Worker     │
                    │  (Semgrep)   │
                    └──────────────┘
```

## 🔧 Configuration

Copy `.env.example` to `.env` and customize:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/vulnscan

# Redis
REDIS_URL=redis://redis:6379/0

# API
API_URL=http://localhost:8000
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scans/repo` | Scan a Git repository |
| POST | `/api/scans/file` | Scan uploaded file |
| POST | `/api/scans/code` | Scan pasted code |
| GET | `/api/scans/` | List all scans |
| GET | `/api/scans/{id}` | Get scan details |

## 🧪 Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Restart frontend after changes
docker compose build frontend
docker compose up -d frontend

# Stop everything
docker compose down
```

## 🔒 Security Notes

- Scans run in isolated containers
- No code is permanently stored (only scan results)
- Files are processed in `/tmp` and cleaned up
- Use at your own risk for sensitive codebases

## 📋 Roadmap

- [ ] SARIF export
- [ ] Webhook notifications
- [ ] GitHub/GitLab integration
- [ ] Custom rule sets
- [ ] Team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

Built with ❤️ using FastAPI, Next.js, and Docker
