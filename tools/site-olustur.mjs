// GitHub Pages sitesini oluşturur (_site klasörüne):
//   /                     → main dalındaki program (canlı sürüm)
//   /gelistir/            → geliştirici sayfası
//   /onizleme/<dal>/      → her geliştirme dalının önizlemesi (ayrı depolama + sarı uyarı bandı)
//   /onizleme/liste.json  → önizleme listesi (geliştirici sayfası okur)
// Kullanım: node tools/site-olustur.mjs [çıktı klasörü]   (git deposunun içinde, tüm dallar fetch edilmiş olmalı)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CIKTI = path.resolve(process.argv[2] || '_site');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const ANA = process.env.ANA_DAL || 'main';

fs.rmSync(CIKTI, { recursive: true, force: true });
fs.mkdirSync(path.join(CIKTI, 'onizleme'), { recursive: true });

const ref = d => (git('rev-parse', '--verify', '--quiet', 'origin/' + d + '^{commit}').trim() ? 'origin/' + d : d);
const dosyaAl = (r, f) => { try { return git('show', r + ':' + f); } catch (e) { return null; } };

/* 1) Canlı sürüm ve yardımcı dosyalar */
const anaRef = ref(ANA);
fs.writeFileSync(path.join(CIKTI, 'index.html'), dosyaAl(anaRef, 'index.html'));
for (const f of ['CHANGELOG.md', 'README.md']) { const c = dosyaAl(anaRef, f); if (c != null) fs.writeFileSync(path.join(CIKTI, f), c); }
const gelistir = dosyaAl(anaRef, 'gelistir/index.html');
if (gelistir) { fs.mkdirSync(path.join(CIKTI, 'gelistir'), { recursive: true }); fs.writeFileSync(path.join(CIKTI, 'gelistir', 'index.html'), gelistir); }
fs.writeFileSync(path.join(CIKTI, '.nojekyll'), '');

/* 2) Önizlemeler */
const slug = d => d.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'dal';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dallar = git('for-each-ref', '--format=%(refname:short)|%(committerdate:iso-strict)|%(subject)|%(authorname)', 'refs/remotes/origin')
  .split('\n').filter(Boolean).map(l => { const [r, tarih, konu, yazar] = l.split('|'); return { dal: r.replace(/^origin\//, ''), ref: r, tarih, konu, yazar }; })
  .filter(x => x.dal !== ANA && x.dal !== 'HEAD' && x.dal !== 'origin');

const liste = [];
for (const d of dallar) {
  let h = dosyaAl(d.ref, 'index.html');
  if (!h) continue;
  const s = slug(d.dal), uyarilar = [];
  const degistir = (eski, yeni, ad) => { if (h.includes(eski)) h = h.replace(eski, yeni); else uyarilar.push(ad); };
  // Önizleme gerçek verilere dokunmasın: ayrı depolama anahtarları
  degistir("const KEY = 'teftis_prog_v2', KEY1 = 'teftis_prog_v1';", "const KEY = 'teftis_onizleme_" + s + "', KEY1 = 'teftis_onizleme_yok';", 'KEY');
  degistir("const IDB_AD = 'teftis_db'", "const IDB_AD = 'teftis_onizleme_db_" + s + "'", 'IDB_AD');
  const bant = '<div id="onizlemeBant" style="position:sticky;top:0;z-index:60;background:#ffd84d;color:#3b2f00;padding:8px 16px;font:600 14px/1.4 system-ui,sans-serif;border-bottom:2px solid #c9a400">'
    + 'ÖNİZLEME — “' + esc(d.dal) + '” · Bu sayfa deneme içindir. Buraya girdiğiniz bilgiler gerçek programınızdan ayrı saklanır. '
    + (uyarilar.length ? '<span style="color:#9a1c00">DİKKAT: depolama ayrımı yapılamadı (' + uyarilar.join(', ') + '); gerçek verilerinizle denemeyin.</span> ' : '')
    + '<a href="../../gelistir/" style="color:#3b2f00">Geliştirici sayfası</a></div>';
  h = h.replace(/<body([^>]*)>/, m => m + bant);
  h = h.replace(/<title>/, '<title>[Önizleme] ');
  fs.mkdirSync(path.join(CIKTI, 'onizleme', s), { recursive: true });
  fs.writeFileSync(path.join(CIKTI, 'onizleme', s, 'index.html'), h);
  liste.push({ dal: d.dal, klasor: s, tarih: d.tarih, konu: d.konu, yazar: d.yazar, depolamaAyri: !uyarilar.length });
}
liste.sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
fs.writeFileSync(path.join(CIKTI, 'onizleme', 'liste.json'), JSON.stringify({ olusturma: new Date().toISOString(), ana: { dal: ANA, konu: git('log', '-1', '--format=%s', anaRef).trim(), tarih: git('log', '-1', '--format=%cI', anaRef).trim() }, onizlemeler: liste }, null, 2));
console.log('Site oluşturuldu: ' + CIKTI + ' — canlı sürüm + ' + liste.length + ' önizleme' + (liste.length ? ' (' + liste.map(x => x.klasor).join(', ') + ')' : ''));
