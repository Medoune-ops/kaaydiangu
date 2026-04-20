const fs = require('fs');
const path = require('path');

const files = [
  'lib/recu-pdf.ts',
  'components/dashboard/enregistrement-paiement.tsx',
  'components/dashboard/documents-eleve.tsx',
  'components/dashboard/paiements-eleve.tsx',
  'app/api/paiements/route.ts',
  'app/api/impayes/comptable/route.ts',
  'app/api/impayes/rappel/route.ts',
  'app/api/comptabilite/bilan-pdf/route.ts',
  'app/api/comptabilite/export-excel/route.ts'
];

for (const file of files) {
  const p = path.join('c:\\Users\\Medoune\\Desktop\\mes dossiers\\kaaydiangu', file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/MOIS_NOMS\s*=\s*\[\s*"",/g, 'MOIS_NOMS = [\n  "Inscription",');
    fs.writeFileSync(p, content);
    console.log("Updated", file);
  }
}
