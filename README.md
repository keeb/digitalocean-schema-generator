# schema-generator

## Requirements

* `key` file which contains a API Token
* `virtualenv env` && `source env/bin/activate`

## Running

* `export SI_API_KEY=cat $(key)`
* `python si_auth.py AWS::EC2::VPC` -> gives you base VPC Schema

## Orientation

* generate_prompt.md contains the prompt to create a base schema
* digitalocean-api-spec.yml is the publicly available digital ocean spec
