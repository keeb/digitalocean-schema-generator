# DigitalOcean Schema Generator

This project generates System Initiative (SI) schemas for DigitalOcean resources following the `si-conduit` format.

## Requirements

- `python3` installed
- `virtualenv` installed
- `key` file which contains a API Token

## Setup

Run `virtualenv env` and then `source env/bin/activate`.

## Running

Run `export SI_API_KEY="$(cat key)"` and then `python si_auth.py AWS::EC2::VPC`.

## Project Structure

This repository follows the si-conduit standardized project structure:

```
.
├── .conduitroot                       # Marker file identifying the project root
├── schemas/                           # All schema definitions
│   └── <schema-name>/                 # Each resource has its own directory
│       ├── .format-version            # Format version identifier
│       ├── schema.ts                  # Main schema definition (PropBuilder)
│       ├── schema.metadata.json       # Asset metadata
│       ├── actions/                   # CRUD operations
│       │   ├── create.ts
│       │   ├── create.metadata.json
│       │   ├── destroy.ts
│       │   ├── destroy.metadata.json
│       │   ├── refresh.ts
│       │   ├── refresh.metadata.json
│       │   ├── update.ts
│       │   └── update.metadata.json
│       ├── codeGenerators/            # Code generation functions
│       ├── management/                # Resource discovery/import
│       └── qualifications/            # Validation functions
├── prompts/                           # Code generation prompts
│   ├── generate-schema-prompt.md      # Prompt for creating base schemas
│   └── generate-actions-prompt.md     # Prompt for generating CRUD actions
└── digitalocean-api-spec.yaml         # DigitalOcean API specification

```

## Resources

- `digitalocean-api-spec.yaml` - The publicly available DigitalOcean API specification
- `prompts/generate-schema-prompt.md` - Comprehensive prompt for generating asset schemas
- `prompts/generate-actions-prompt.md` - Prompt for generating CRUD action implementations
