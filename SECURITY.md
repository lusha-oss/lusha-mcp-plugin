# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this plugin or in how it integrates
with the Lusha MCP server, please report it privately. **Do not open a public
GitHub issue for security reports.**

- Email: [security@lusha.com](mailto:security@lusha.com)
- Include a description of the issue, steps to reproduce, and any relevant logs
  or proof of concept.

We will acknowledge your report, investigate, and keep you informed of the
resolution. Please give us a reasonable amount of time to address the issue
before any public disclosure.

## Scope

This repository contains plugin manifests and skill definitions. It does not
store credentials. Authentication to Lusha is handled via OAuth against the
Lusha MCP server (`mcp.lusha.com`); tokens are managed by your AI client, not by
this repository.

For vulnerabilities in the Lusha platform or API itself, see
[lusha.com](https://www.lusha.com) for the appropriate reporting channel.
