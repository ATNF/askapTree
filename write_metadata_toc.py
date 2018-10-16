#!/usr/bin/env python

import sys
import argparse
from influxdb import InfluxDBClient

parser = argparse.ArgumentParser()
parser.add_argument("--host", dest="host", required=True)
parser.add_argument("--port", dest="port", default="8086")
parser.add_argument("--database", dest="database", required=True)
parser.add_argument("--user", dest="username")
parser.add_argument("--pass", dest="password")
parser.add_argument('--toc', dest="toc", required=True)
args = parser.parse_args()

client = InfluxDBClient(host=args.host, port=args.port, database=args.database, username=args.username, password=args.password)

measurements = client.get_list_measurements()
if 'metadata.toc' in measurements:
    raise RuntimeError("need to delete existing TOC measurement first")

with open(args.toc, 'r') as f:
    for line in f:
        level = (len(line) - len(line.lstrip())) / 4
        line = line.strip()
        if len(line) == 0:
            continue
        if line.startswith('.h1'):
            level1 = line.replace('.h1', '').strip()
            level2 = None
        elif line.startswith('.h2'):
            level2 = line.replace('.h2', '').strip()
        elif level1 == 'hidden' or level1 == 'metadata':
            continue
        else:
            splits = line.split('-')
            tags = {"measurement" :splits[0].strip(), "level1" : level1}
            if level2 is not None:
                tags["level2"] = level2
            if len(splits) > 1:
                tags["desc"] = splits[1].strip()
            print "{0} {1} {2}".format(level1, level2, tags)
            json = [ { "measurement" : "metadata.toc",
                        "tags" : tags,
                        "fields" : { "dummy" : 0 },
                        "time" : "1970-01-01T00:00:00Z"
                     }
                   ]
            client.write_points(json)
