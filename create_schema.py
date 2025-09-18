#!/usr/bin/env python3

import sys
import json
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

si.create_schema(
    category="Digital Ocean",
    name=metadata["name"],
    code=ts,
    description=metadata["description"],
    link=metadata["link"],
)
