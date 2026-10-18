"""Prepare the material-free, Z-up RealityScan web copy. Never run on originals."""
import json, struct
from pathlib import Path
p = Path(__file__).resolve().parents[1] / 'dist/assets/weihesteine.glb'
b = p.read_bytes()
length, kind = struct.unpack_from('<II', b, 12)
assert kind == 0x4e4f534a
j = json.loads(b[20:20 + length])
j['materials'] = [{'name': 'Stone (web display)', 'doubleSided': True,
    'pbrMetallicRoughness': {'baseColorFactor': [0.78, 0.73, 0.63, 1], 'metallicFactor': 0, 'roughnessFactor': 1}}]
for mesh in j['meshes']:
    for primitive in mesh['primitives']:
        primitive['material'] = 0
for node in j['nodes']:
    if 'mesh' in node:
        node['rotation'] = [-0.7071067811865476, 0, 0, 0.7071067811865476]
j.setdefault('asset', {}).setdefault('extras', {})['webChanges'] = 'Reduced geometry, Z-up to Y-up; neutral stone material added to material-free export. No original texture supplied.'
encoded = json.dumps(j, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
tail = b[20 + length:]
p.write_bytes(struct.pack('<III', 0x46546c67, 2, 20 + len(encoded) + len(tail)) + struct.pack('<II', len(encoded), 0x4e4f534a) + encoded + tail)
print('Prepared:', p.name)
