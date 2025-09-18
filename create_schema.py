#!/usr/bin/env python3

from util import SI

si = SI()
si.create_or_use_change_set("Add schema")

ts = "".join(open("ssh-key-schema.js", "r").readlines())

si.create_schema("Digital Ocean", ts, "Fake", "Poop", link="https://google.com")
