# OpenClaw AI Gateway

The AWCMS project utilizes **OpenClaw** as a multi-tenant AI gateway to securely manage and route external tool/agent requests. This document outlines the architecture and configuration of our local OpenClaw instance.

## Overview

OpenClaw is installed and configured as an AI Agent Gateway for the `awcms` workspace. It provides:

1. **Multi-Tenant Agent Isolation**: Separate workspaces and profiles for different tenants (e.g., `tenant_a`, `tenant_b`).
2. **Channel Routing**: Automatically routing incoming messages from platforms like WhatsApp, Telegram, Slack, and Discord to the correct tenant agent.
3. **Gateway Security**: Strict token authentication, rate limiting, and loopback binding to secure AI access.

## Configuration File

The primary configuration is defined in `openclaw/openclaw.json` (which is typically symlinked or copied to `~/.openclaw/openclaw.json` on the host).

### 1. Gateway Security

The gateway is hardened to prevent unauthorized access:

```json
"gateway": {
  "bind": "loopback",
  "auth": {
    "mode": "token",
    "rateLimit": {
      "maxAttempts": 10,
      "windowMs": 60000,
      "lockoutMs": 300000,
      "exemptLoopback": true
    }
  },
  "trustedProxies": ["127.0.0.1"],
  "tools": {
    "deny": ["browser"]
  }
}
```

- **Bind**: Set to `loopback` (127.0.0.1) so the gateway is strictly internal. Public requests must pass through our reverse proxy.
- **Auth**: Token-based authentication.
- **Rate Limiting**: Limits requests to 10 per minute per token. Exceeding this triggers a 5-minute (300,000ms) lockout.
- **Tool Restrictions**: The `browser` tool is explicitly denied at the gateway level for security.

### 2. Multi-Tenant Agent Isolation

We define multiple agents within the gateway, each assigned to a specific tenant. This ensures complete isolation of data, context, and capabilities:

- **Tenant A (`tenant_a`)**:
  - Primary model: `anthropic/claude-3-5-sonnet`
  - Workspace: isolated to `~/.openclaw/workspace-tenant-a`
  - Profile: `coding` tools allowed.
- **Tenant B (`tenant_b`)**:
  - Primary model: `anthropic/claude-3-5-sonnet`
  - Workspace: isolated to `~/.openclaw/workspace-tenant-b`
  - Profile: `messaging` tools allowed (Slack, Discord).

### 3. Channel Bindings (Routing)

OpenClaw automatically routes incoming webhook requests from external platforms to the correct tenant agent based on the channel and account details:

- **WhatsApp** (`accountId: tenant_a_account`) → Routes to `tenant_a`
- **Telegram** → Routes to `tenant_a`
- **Slack** → Routes to `tenant_b`
- **Discord** → Routes to `tenant_b`

## Operational Requirements

- **Node.js**: OpenClaw requires Node.js **>= 22.12.0**. AWCMS standardizes on environment `v22.22.0`.
- **Permissions**: The config file `~/.openclaw/openclaw.json` must have `chmod 600` permissions to protect embedded secrets or token structures.
