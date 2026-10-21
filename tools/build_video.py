#!/usr/bin/env python3
"""Assemble the labelled browser-preview loop; requires ffmpeg."""
from pathlib import Path
import subprocess, argparse
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--frames',type=Path,required=True,help='Directory containing four ordered interface captures')
args=parser.parse_args()
frames=sorted(args.frames.glob('*.webp'))
if len(frames)!=4:raise SystemExit('Provide exactly four ordered WebP frames.')
cmd=['ffmpeg','-y']
for f in frames:cmd+=['-loop','1','-t','3.5','-i',str(f)]
parts=[f'[{i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x080c13,setsar=1,fps=24,format=yuv420p[v{i}]' for i in range(len(frames))]
parts+=['[v0][v1]xfade=transition=fade:duration=0.4:offset=3.1[x1]','[x1][v2]xfade=transition=fade:duration=0.4:offset=6.2[x2]','[x2][v3]xfade=transition=fade:duration=0.4:offset=9.3[out]']
cmd+=['-filter_complex',';'.join(parts),'-map','[out]','-c:v','libx264','-crf','25','-preset','fast','-an','-movflags','+faststart',str(root/'assets/media/preview.mp4'),'-loglevel','error']
subprocess.run(cmd,check=True)
