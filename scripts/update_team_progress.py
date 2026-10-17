#!/usr/bin/env python3
"""Validate one WORK report and update only that team's JSON; never pushes or contacts WP."""
import argparse
from datetime import datetime, timezone, timedelta
import json
from pathlib import Path
from urllib.parse import urlparse

TEAMS = ('research', 'a', 'b', 'c')
FIELDS = {'schema_version','team_id','updated_at','status','task','progress','last_report','issues','source_urls'}
STATUSES = {'unconfirmed','in_progress','waiting','blocked','completed'}
ROOT = Path(__file__).resolve().parents[1]

def validate(report, team):
    if not isinstance(report, dict) or set(report) != FIELDS:
        raise ValueError('Report must contain exactly the documented fields')
    if type(report['schema_version']) is not int or report['schema_version'] != 1 or report['team_id'] != team or team not in TEAMS:
        raise ValueError('Invalid schema version or team_id')
    if report['status'] not in STATUSES:
        raise ValueError('Invalid status')
    for field, limit in [('task',160),('progress',500),('last_report',2000)]:
        value=report[field]
        if value is not None and (not isinstance(value,str) or not value.strip() or len(value)>limit):
            raise ValueError('Invalid '+field)
    for field, limit, length in [('issues',10,500),('source_urls',5,1000)]:
        value=report[field]
        if not isinstance(value,list) or len(value)>limit or any(not isinstance(v,str) or not v.strip() or len(v)>length for v in value):
            raise ValueError('Invalid '+field)
    for url in report['source_urls']:
        parsed=urlparse(url)
        if parsed.scheme!='https' or not parsed.netloc or parsed.username or parsed.password:
            raise ValueError('source_urls must be public HTTPS links without credentials')
    if report['updated_at'] is None:
        if report['status']!='unconfirmed' or any(report[k] is not None for k in ['task','progress','last_report']) or report['issues'] or report['source_urls']:
            raise ValueError('An unreported team cannot have activity or report details')
    else:
        if not isinstance(report['updated_at'],str): raise ValueError('Invalid updated_at')
        stamp=datetime.fromisoformat(report['updated_at'].replace('Z','+00:00'))
        if stamp.tzinfo is None or stamp>datetime.now(timezone.utc)+timedelta(minutes=5):
            raise ValueError('updated_at requires timezone and cannot be in the future')
        if report['status']=='unconfirmed' or any(not report[k] for k in ['task','progress','last_report']):
            raise ValueError('A report requires task, progress, last_report and an explicit status')
    return report

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--team',choices=TEAMS,required=True)
    parser.add_argument('--report',type=Path,required=True)
    parser.add_argument('--check',action='store_true',help='Validate without changing any file')
    args=parser.parse_args()
    report=json.loads(args.report.read_text(encoding='utf-8'))
    # Omit updated_at when writing a new real report; the WORK's save time is used.
    report.setdefault('updated_at',datetime.now(timezone.utc).isoformat(timespec='seconds'))
    validate(report,args.team)
    if not args.check:
        target=ROOT/'progress'/'teams'/(args.team+'.json')
        target.parent.mkdir(parents=True,exist_ok=True)
        temp=target.with_suffix('.json.tmp')
        temp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        temp.replace(target)
    print(json.dumps({'team_id':args.team,'validated':True,'written':not args.check},ensure_ascii=False))

if __name__=='__main__':
    main()
