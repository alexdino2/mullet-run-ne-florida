"""Extract Florida's outline and Atlantic coastline from us-atlas TopoJSON.

Usage:
  curl -sSL -o states-10m.json https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json
  python3 video/extract_florida.py states-10m.json video/data/florida.json
"""
import json
import sys


def decode_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((round(x * sx + tx, 4), round(y * sy + ty, 4)))
        arcs.append(pts)
    return arcs


def ring(arcs, idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out += pts if not out else pts[1:]
    return out


def main(src, dst):
    topo = json.load(open(src))
    arcs = decode_arcs(topo)
    fl = next(g for g in topo["objects"]["states"]["geometries"] if g["properties"]["name"] == "Florida")
    polys = [ring(arcs, poly[0]) for poly in fl["arcs"]]
    mainland = max(polys, key=len)

    # Atlantic coast: the stretch of the mainland ring east of -81.6 between
    # the Georgia line (St. Marys, ~30.71N) and Miami (~25.75N), north to south.
    n = len(mainland)
    start = max(range(n), key=lambda i: mainland[i][1] if mainland[i][0] > -81.6 else -99)
    def walk(step):
        out, i = [], start
        for _ in range(n):
            lon, lat = mainland[i]
            if lat < 25.6:
                break
            out.append([lon, lat])
            i = (i + step) % n
        return out
    a, b = walk(1), walk(-1)
    # The east coast is the direction that stays east of -81.6 the whole way down.
    coast = a if min(p[0] for p in a) > min(p[0] for p in b) else b

    json.dump({"polygons": polys, "atlantic": coast}, open(dst, "w"), separators=(",", ":"))
    print(f"{len(polys)} polygons, mainland {len(mainland)} pts, atlantic coast {len(coast)} pts")
    print("coast from", coast[0], "to", coast[-1])


if __name__ == "__main__":
    main(*sys.argv[1:3])
