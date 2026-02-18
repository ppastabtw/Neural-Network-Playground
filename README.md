# Neural Network Playground

An interactive web application for learning neural networks by visually designing, training, and testing Multi-Layer Perceptrons — no code required.

**Live at [nurel.app](https://nurel.app)**

**Team:** 5 developers | **Course:** SE101, University of Waterloo | **Term:** Fall 2025

---

## Features

- **Visual Model Builder** — Design neural network architectures with a drag-and-drop interface (React Flow)
- **Real-time Training** — Watch your model learn with live loss and accuracy charts
- **5 Datasets** — MNIST, Iris, California Housing, Wine Quality, and Synthetic (spiral/XOR)
- **Template System** — Pre-built architectures to get started quickly
- **Testing Panel** — Run predictions on trained models with interactive, dataset-specific input forms

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, React Flow, Recharts, Tailwind CSS |
| **Backend** | FastAPI, PyTorch, scikit-learn, NumPy, Pandas |
| **Database** | PostgreSQL (RDS) / SQLite (dev), SQLAlchemy, Alembic |
| **Infra** | AWS EC2, Nginx, Uvicorn, GitHub Actions CI/CD |

---

## Architecture

```
                    ┌──────────────────────────┐
                    │      GitHub Actions       │
                    │  CI: lint, test, build     │
                    └────┬───────────┬──────────┘
                         │           │
                  PR to main    Push to main
                         │           │
                  ┌──────▼──┐  ┌────▼──────┐
                  │ Staging  │  │Production │
                  │   EC2    │  │   EC2     │
                  └────┬─────┘ └────┬──────┘
                       │             │
                  Nginx (80/443) + Uvicorn (8000)
                       │             │
                  ┌────▼─────────────▼──────┐
                  │       Amazon RDS        │
                  │      PostgreSQL         │
                  └─────────────────────────┘
```

---

## Quick Start (Local Development)

> **Windows users:** See [docs/WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) for a detailed guide.

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
PYTHONPATH=src uvicorn src.backend.api.main:app --reload --port 8000
```

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

### Access Points
- **App:** http://localhost:5173
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs

---

## CI/CD

Every push and PR runs the [CI pipeline](.github/workflows/ci.yml):
- **Backend:** black, isort, flake8, pytest with coverage
- **Frontend:** ESLint, Vitest, production build

Deployments are automated via GitHub Actions:
- **PR to main** — deploys to [staging.nurel.app](https://staging.nurel.app)
- **Merge to main** — deploys to [nurel.app](https://nurel.app)

See [deploy/AWS_SETUP.md](deploy/AWS_SETUP.md) for infrastructure details.

---

## Testing

```bash
# Backend
pytest --cov=src/backend

# Frontend
cd src/frontend
npm test
```

---

## Documentation

- [User Manual](docs/user_manual.md)
- [Test Report](docs/test_report.md)
- [Dataset Overview](docs/datasets/README.md)
- [Windows Setup](docs/WINDOWS_SETUP.md)
- [AWS Infrastructure](deploy/AWS_SETUP.md)

---

## Team

| Name |
|------|
| Yi Xing |
| Sicheng Ouyang |
| David Estrine |
| Kevin Yan |
| Ario Ostovary |
