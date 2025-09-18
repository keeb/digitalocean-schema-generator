# schema-generator

## Requirements

- `python3` installed
- `virtualenv` installed
- `key` file which contains a API Token

## Setup

Run `virtualenv env` and then `source env/bin/activate`.

## Running

Run `export SI_API_KEY="cat $(key)"` and then `python si_auth.py AWS::EC2::VPC`.

## Orientation

- `generate_prompt.md` contains the prompt to create a base schema
- `digitalocean-api-spec.yml` is the publicly available digital ocean spec
