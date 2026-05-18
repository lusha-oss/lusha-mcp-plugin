# Changelog

All notable changes to the Lusha Claude plugin are documented here. This project
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-17

### Added

- Initial release of the Lusha official plugin for Claude.
- Four skills wired to the Lusha MCP Claude store (`https://mcp.lusha.com/mcp/claude`):
  - `enrich-contact` — look up a person and return verified direct/mobile phones, email, and company context.
  - `prospect` — turn an ICP description into an enriched, phone-first lead list.
  - `signal-prospect` — start from a buying signal (funding, hiring surge, job change) and return the right decision makers with verified phones.
  - `lookalike-prospect` — expand from 5+ reference accounts/contacts to a matched, enriched list.
- OAuth-based authentication via `https://auth.lusha.com` (no client-side credentials required).
- Single-plugin marketplace manifest at `.claude-plugin/marketplace.json` so the repo doubles as a marketplace source for `/plugin marketplace add lusha-oss/lusha-mcp-plugin`.
