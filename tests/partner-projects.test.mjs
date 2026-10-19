import test from 'node:test';
import assert from 'node:assert/strict';
import { projectsForPartner, partnerProjectsHref } from '../src/lib/partner-projects.mjs';

const clients = ['Gavi · MSHP', 'Gavi · MSHP', 'Gavi · MSHP', 'UNICEF · Gavi', 'Expertise France', 'Gavi · MSHP', 'Institut Français de Guinée', 'Institut Français de Guinée', 'RTG', 'AGUIPEL · Maison de la Presse', 'Université Kofi Annan', 'Banque Mondiale', 'MSHP', 'Enabel', 'COBAD SA', 'Expertise France', 'École privée, Matoto', 'Grassroots', 'AGSP', 'Université Mercure International', 'Exclusiva'];
const projects = clients.map((client, i) => ({ slug:`projet-${i}`, client }));

test('The nine published partner names resolve to the expected project counts', () => {
  const expected = [['Gavi',5],['Android',0],['UNICEF',1],['Expertise France',2],['Banque Mondiale',1],['Institut Français de Guinée',2],['Université Kofi Annan',1],['AGUIPEL',1],['Ministère de la Santé',5]];
  for (const [nom,count] of expected) assert.equal(projectsForPartner({nom},projects).length,count,nom);
});

test('Partner matching ignores accents, case and punctuation and recognizes MSHP', () => {
  assert.equal(projectsForPartner({nom:'MINISTÈRE DE LA SANTÉ'},[{client:'Gavi / MSHP'}]).length,1);
  assert.equal(projectsForPartner({nom:'Institut Français de Guinée'},[{client:'institut francais de guinee'}]).length,1);
});

test('Matching does not attribute a project from its summary or partial client name', () => {
  assert.equal(projectsForPartner({nom:'Gavi'},[{client:'Autre institution',resume:'Projet cité par Gavi'}]).length,0);
  assert.equal(projectsForPartner({nom:'Gavi'},[{client:'Gavillon'}]).length,0);
  assert.deepEqual(projectsForPartner({nom:''},projects),[]);
});

test('Partner filter links encode IDs and target the project section', () => {
  const href=partnerProjectsHref({id:'ministère/santé & partenaires'});
  const url=new URL(href,'https://example.com');
  assert.equal(url.pathname,'/realisations');
  assert.equal(url.searchParams.get('partenaire'),'ministère/santé & partenaires');
  assert.equal(url.hash,'#projets');
});
