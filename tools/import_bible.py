#!/usr/bin/env python3
"""Convertit un texte biblique (dont vous avez le droit d'usage) en fichiers pour l'application.
Usage :  python3 tools/import_bible.py mon_texte.txt tob
Format du fichier d'entrée : une ligne par verset, ex.
    Matthieu 1:1 Livre de la genèse de Jésus Christ...
Résultat : bible/<version>/<n>.json  (n = numéro du livre, 0 = Matthieu ... 26 = Apocalypse)"""
import sys, re, json, os, unicodedata
LIVRES = ["Matthieu","Marc","Luc","Jean","Actes","Romains","1 Corinthiens","2 Corinthiens","Galates","Éphésiens","Philippiens","Colossiens","1 Thessaloniciens","2 Thessaloniciens","1 Timothée","2 Timothée","Tite","Philémon","Hébreux","Jacques","1 Pierre","2 Pierre","1 Jean","2 Jean","3 Jean","Jude","Apocalypse"]
norm = lambda s: unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower().strip()
IDX = {norm(n): i for i, n in enumerate(LIVRES)}
src, ver = sys.argv[1], sys.argv[2]
data, bad = {}, 0
for ligne in open(src, encoding="utf-8"):
    m = re.match(r"^(.+?)\s+(\d+):(\d+)\s+(.*)$", ligne.strip())
    if not m or norm(m.group(1)) not in IDX: bad += 1; continue
    b, c, v = IDX[norm(m.group(1))], int(m.group(2)), int(m.group(3))
    vs = data.setdefault(b, {}).setdefault(str(c), [])
    while len(vs) < v: vs.append("")
    vs[v - 1] = m.group(4)
out = os.path.join("bible", ver); os.makedirs(out, exist_ok=True)
for b, ch in data.items(): json.dump(ch, open(os.path.join(out, f"{b}.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(data)} livre(s) écrits dans {out}/ ; {bad} ligne(s) ignorée(s)")
