---
name: Replit preview API calls
description: How frontend API requests should address backend routes inside Replit's proxied preview.
---

Frontend requests to the app's own backend should use same-origin relative paths such as `/api/...`, with the dev server proxy forwarding them to the backend. Do not hardcode `localhost` or a backend port in browser-side requests.

**Why:** In Replit's proxied preview, browser-side `localhost` points to the visitor's device, not the app container. This caused network errors across uploads, notes, and doubt-solving flows.

**How to apply:** Use relative paths for frontend `fetch`/Axios calls to this app. Keep localhost URLs only for server-side or local diagnostic commands, not client code.
