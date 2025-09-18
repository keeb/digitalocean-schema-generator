#!/usr/bin/env python3

import sys
import json
import os
from util import SI

if len(sys.argv) != 3:
    print("Usage: python3 create_schema.py <filename> <metadata_file>")
    sys.exit(1)

filename = sys.argv[1]
metadata_file = sys.argv[2]

si = SI()
si.create_or_use_change_set("Add schema")

ts = "".join(open(filename, "r").readlines())

with open(metadata_file, "r") as f:
    metadata = json.load(f)

schema_result = si.create_schema(
    category="Digital Ocean",
    name=metadata["name"],
    code=ts,
    description=metadata["description"],
    link=metadata["link"],
)

is_credential = "SecretDefinitionBuilder" in ts
if is_credential:
    print("Detected credential schema, creating authentication and qualification functions...")

    schema_id = "00000000000000000000000000"
    schema_variant_id = schema_result["defaultVariantId"]

    auth_filename = filename.replace("-credential-schema.js", "-auth-func.js")

    if os.path.exists(auth_filename):
        print(f"Found auth file: {auth_filename}")
        auth_code = "".join(open(auth_filename, "r").readlines())

        si.create_schema_variant_authentication_func(
            schema_id=schema_id,
            schema_variant_id=schema_variant_id,
            name="digitalOceanStoreCreds",
            code=auth_code,
            display_name="DO Store Creds",
            description="Store the credentials for DO"
        )
        print("Authentication function created successfully!")
    else:
        print(f"Warning: Auth file not found at {auth_filename}")

    qualification_filename = filename.replace("-auth-func.js", "-qualification-func.js")

    if os.path.exists(qualification_filename):
        print(f"Found qualification file: {qualification_filename}")
        qualification_code = "".join(open(qualification_filename, "r").readlines())

        si.create_schema_variant_qualification_func(
            schema_id=schema_id,
            schema_variant_id=schema_variant_id,
            name="digitalOceanCheckCreds",
            code=qualification_code,
            display_name="DO Check Creds",
            description="Verify that the credentials work"
        )
        print("Qualification function created successfully!")
    else:
        print(f"Warning: Qualification file not found at {qualification_filename}")
