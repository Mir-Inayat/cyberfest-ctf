# Cyberfest CTF Platform — Digital Defence Club

> A fully customized Capture The Flag (CTF) competition platform, built and deployed for **Cyberfest 2026**, organized by CBIT's Digital Defence Club.

![Python](https://img.shields.io/badge/Python-0d1117?style=flat-square&logo=python&logoColor=58a6ff)
![Flask](https://img.shields.io/badge/Flask-0d1117?style=flat-square&logo=flask&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-0d1117?style=flat-square&logo=docker&logoColor=2496ed)
![JavaScript](https://img.shields.io/badge/JavaScript-0d1117?style=flat-square&logo=javascript&logoColor=f7df1e)

---

## What it does

This is a customized fork of [CTFd](https://github.com/CTFd/CTFd), deployed and branded for CBIT's Digital Defence Club annual cybersecurity event — **Cyberfest**. The platform hosted live CTF challenges for participants across web exploitation, cryptography, forensics, and reverse engineering.

**Event scale:**
- Hosted for **550+ offline** and **1700+ online** participants across Cyberfest
- Custom DDC branding, theming, and challenge set
- Dockerized deployment for reliable, containerized hosting

---

## Customizations

- Full **DDC branding** — custom logo, color scheme, and UI theme
- Custom challenge categories tailored to DDC's CTF curriculum
- Deployment hardening: security config review and container isolation
- Automated challenge population via `populate.py`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask (CTFd core) |
| Frontend | Jinja2 + JavaScript |
| Database | SQLite / PostgreSQL |
| Deployment | Docker + docker-compose |
| CI | GitHub Actions |

---

## Running Locally

```bash
# Clone and install
pip install -r requirements.txt

# Run dev server
python serve.py

# Or with Docker
docker-compose up
```

---

## About DDC

The Digital Defence Club (DDC) at CBIT is a student-led cybersecurity community focused on CTF competitions, ethical hacking workshops, and building security awareness. This platform was built and maintained by the club's leadership team.

**Organizer:** Mir Inayat Ahmed (Vice President, Digital Defence Club)
