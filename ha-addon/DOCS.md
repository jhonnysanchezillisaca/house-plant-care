# House Plant Care - Home Assistant Add-on

Track and manage your house plant care schedules with alerts and overdue notifications.

## Installation

1. Copy the `ha-addon` folder to your Home Assistant `/addons/` directory (via Samba or SSH)
2. In Home Assistant, go to **Settings** → **Apps** → **App Store** (bottom right)
3. Click the three-dot menu → **Check for updates**
4. Find **House Plant Care** under "Local apps" and install it
5. Configure the add-on options (session password, Trefle token)
6. Start the add-on
7. Access via the sidebar under **Plant Care**

## Configuration

| Option | Required | Description |
|--------|----------|-------------|
| `session_password` | No | Encryption password for browser sessions (auto-generated if empty) |
| `trefle_api_token` | No | Trefle API token for plant species lookup |

## Features

- **Ingress UI**: Access the app directly from the Home Assistant sidebar
- **Plant management**: Add plants with photos, species lookup, room assignment
- **Care schedules**: Set up recurring watering, fertilizing, misting, etc.
- **Overdue alerts**: Dashboard highlights overdue care tasks
- **Activity logging**: Track when care was performed

## Home Assistant Integration

For deeper integration (sensors, automations, notifications), install the
`custom_components/house_plant_care` custom integration and create an API token
in the app's Settings page.

## How Ingress Works

Home Assistant ingress allows an add-on to be embedded in the HA sidebar. It
works by proxying requests through the HA core server. Here's how our setup
handles the path rewriting challenge:

### The Problem

When HA proxies a request via ingress, it:

1. Receives a request like `GET /api/hassio_ingress/XXXX/page`
2. Strips the ingress prefix before forwarding to the add-on
3. Adds an `X-Ingress-Path` header with the original prefix (e.g. `/api/hassio_ingress/XXXX`)
4. Sends `GET /page` with `X-Ingress-Path: /api/hassio_ingress/XXXX` to the add-on

This means the add-on receives requests without the ingress prefix, but Nuxt
generates all asset URLs and route links using `baseURL` (which includes the
prefix). Without path rewriting, Nuxt expects paths like
`/api/hassio_ingress/XXXX/_nuxt/xxx.js` but only receives `/_nuxt/xxx.js`.

### The Solution

We use nginx as a reverse proxy to re-add the ingress path prefix before
requests reach Nuxt. This is the key insight: **nginx handles path rewriting
at the HTTP level, which is more reliable than doing it in Nitro middleware
during SSR.**

```
HA Supervisor (172.30.32.2)
  → strips ingress prefix from URL
  → adds X-Ingress-Path header
  → forwards to nginx on port 8099
    → nginx reads X-Ingress-Path header
    → prepends it back to the request path
    → proxies to Nuxt on localhost:3000
      → Nuxt serves assets and routes under the full path
```

### Component Details

**`run.sh`** — Detects the ingress path via `bashio::addon.ingress_entry` and
sets `NUXT_APP_BASE_URL`. This tells Nuxt to prefix all generated URLs
(assets, links, API calls) with the ingress path so browsers request them
through the correct HA proxy URL.

**`nginx.conf`** (the `server {}` block in `/etc/nginx/http.d/`) — Listens on
the ingress port (8099). Only allows connections from the HA supervisor IP
(172.30.32.2). Reads the `X-Ingress-Path` header and prepends it to the
request URI before proxying to Nuxt:

```
proxy_pass http://127.0.0.1:3000$http_x_ingress_path$request_uri;
```

This means a request for `GET /` with `X-Ingress-Path: /api/hassio_ingress/XXXX`
becomes `GET /api/hassio_ingress/XXXX/` when it reaches Nuxt — exactly what
Nuxt expects since `baseURL` is set to that prefix.

**`nuxt.config.ts`** — Sets `app.baseURL` from `NUXT_APP_BASE_URL` env var.
This makes Nuxt generate all URLs with the ingress prefix.

**`server/middleware/ha-ingress.ts`** — Only handles HA-specific logic:
extracts the `X-Ingress-Path` header for reference and auto-logs in HA users.
Does NOT handle path rewriting (nginx does that).

**`server/plugins/ingress-path.ts`** — No longer needed for path rewriting
since nginx handles it. Removed from the add-on.

### Why This Works Reliably

Previous attempts used Nitro plugins/middleware to rewrite paths during SSR.
This was unreliable because:

1. The Nitro `request` hook runs after routing decisions, causing race
   conditions with static asset handlers
2. `/_nuxt/` and `/api/` paths needed special handling that was error-prone
3. Nuxt's asset serving couldn't find files under the wrong path prefix

By moving path rewriting to nginx (before requests reach Nuxt), every request
arrives with the correct prefix already in place. Nuxt never sees
prefix-stripped paths, so routing, asset serving, and API endpoints all work
correctly without any middleware gymnastics.