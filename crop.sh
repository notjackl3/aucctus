#!/usr/bin/env bash
# ./crop.sh original.webm generating-animated.webm 236 96 64  

ffmpeg -c:v libvpx-vp9 -i "$1" -vf "crop=$3:$4:(in_w-$3)/2:(in_h-$4)/2,format=yuva420p,scale=-1:$5" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -b:v 1M -c:a copy "$2"