// Vignettes des réalisations ajoutées depuis le dépôt GitHub (rocket111111152442/LRT).
// Si un fichier manque dans public/images (déploiement fait sans ces binaires), il est
// téléchargé depuis le dépôt à un commit figé, puis vérifié par son empreinte SHA-1.
// Les fichiers déjà présents ne sont pas touchés.
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';

const COMMIT = '6ae249d220a06e8efe12e24a889e5aefc64ae793';
const images = {
  'aei-cote-mer.webp': '9e3f835ed75aef7b0948f0ed65c222a24924fde0',
  'bloomed.webp': '03d6372966d454f038822448cce28b893cbaeaf5',
  'empreinte-de-violettes.webp': '0891414c81506823100d1942eda114f3d202a914',
  'maison-pastier.webp': 'd07db42b7cb432eca579de218a03ada67c674c80',
  'petrin-de-pepiole.webp': '9c964255e034240f57aa58c14532209525b9b550',
};

for (const [name, sha1] of Object.entries(images)) {
  const path = `public/images/${name}`;
  if (existsSync(path)) continue;
  const res = await fetch(`https://raw.githubusercontent.com/rocket111111152442/LRT/${COMMIT}/sites/lullin-web/${path}`);
  if (!res.ok) throw new Error(`${name} : téléchargement impossible (${res.status})`);
  const data = Buffer.from(await res.arrayBuffer());
  if (createHash('sha1').update(data).digest('hex') !== sha1) throw new Error(`${name} : empreinte inattendue`);
  writeFileSync(path, data);
  console.log(`fetch-images : ${name} récupéré`);
}
