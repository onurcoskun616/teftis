// Teftiş Otomasyon Sistemi — uçtan uca testler
// Çalıştırma: npm test   (ya da: node tests/e2e.mjs)
// Her değişiklikten sonra çalıştırılmalı. Bir test başarısız olursa çıkış kodu 1 olur.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEDEF = process.env.TEFTIS_HTML ? path.resolve(process.env.TEFTIS_HTML) : path.join(KOK, 'index.html');
const URL_ = pathToFileURL(HEDEF).href;
const ORNEK = f => path.join(KOK, 'tests', 'ornekler', f);
const GECICI = fs.mkdtempSync(path.join(os.tmpdir(), 'teftis-test-'));

/* Playwright'ı bul: önce proje, sonra bilinen genel konumlar */
function playwrightBul() {
  const req = createRequire(import.meta.url);
  const adaylar = ['playwright', '/opt/npm-tools/node_modules/playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'];
  for (const a of adaylar) { try { return req(a); } catch (e) { /* sıradaki */ } }
  console.error('Playwright bulunamadı. Önce "npm install" ve gerekirse "npx playwright install chromium" çalıştırın.');
  process.exit(2);
}
const { chromium } = playwrightBul();

let gecen = 0, kalan = 0;
const hatalar = [];
async function test(ad, fn) {
  const t0 = Date.now();
  try { await fn(); gecen++; console.log('  ✓ ' + ad + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + ' sn)'); }
  catch (e) { kalan++; hatalar.push(ad); console.log('  ✗ ' + ad + '\n      → ' + String(e && e.message || e).split('\n')[0]); }
}
function esit(a, b, msg) { if (a !== b) throw new Error((msg || 'beklenen') + ': ' + JSON.stringify(b) + ', gelen: ' + JSON.stringify(a)); }
function dogru(k, msg) { if (!k) throw new Error(msg || 'koşul sağlanmadı'); }

const html = fs.readFileSync(HEDEF, 'utf8');
const tarayici = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function yeniSayfa(opts = {}, init) {
  const ctx = await tarayici.newContext(Object.assign({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } }, opts));
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.hatalar = [];
  p.on('pageerror', e => p.hatalar.push(e.message));
  p.on('dialog', d => d.accept());
  await p.goto(URL_);
  await p.waitForFunction(() => window.__teftis && document.querySelector('#icerik'));
  return { ctx, p };
}
const DB = p => p.evaluate(() => JSON.parse(JSON.stringify(window.__teftis.DB)));
const mesaj = p => p.$eval('.tamam', e => e.innerText).catch(() => '');
async function listeyeGit(p) { await p.click('#top [data-e=liste]'); await p.waitForSelector('#xlsDosya', { state: 'attached' }); }
async function bekle(p, ms = 250) { await p.waitForTimeout(ms); }

/* Word dosyasının metnini sayfadaki JSZip ile çıkar */
async function docxMetin(p, dosya) {
  const b64 = fs.readFileSync(dosya).toString('base64');
  return p.evaluate(async b => {
    const z = await window.JSZip.loadAsync(b, { base64: true });
    const xml = await z.file('word/document.xml').async('string');
    return xml.replace(/<w:p[ >]/g, '\n$&').replace(/<[^>]+>/g, '');
  }, b64);
}
async function indir(p, kod) {
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=indir][data-k=' + kod + ']')]);
  const f = path.join(GECICI, kod + '-' + Date.now() + '.docx');
  await d.saveAs(f);
  return f;
}

console.log('\nTeftiş programı testleri — ' + path.relative(KOK, HEDEF) + '\n');

await test('Hazır kütüphaneler (JSZip, docx, PDF.js) değiştirilmemiş', async () => {
  const beklenen = JSON.parse(fs.readFileSync(path.join(KOK, 'tests', 'kutuphane-ozet.json'), 'utf8'));
  const bloklar = {};
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attr, govde] = m;
    if (govde.startsWith('/*!\n\nJSZip')) bloklar.jszip = govde;
    else if (govde.startsWith('var docx = (function')) bloklar.docx = govde;
    else if (attr.includes('id="pdfjsLibSrc"')) bloklar.pdfjs = govde;
    else if (attr.includes('id="pdfjsWorkerSrc"')) bloklar.pdfjsWorker = govde;
  }
  for (const k of Object.keys(beklenen)) {
    dogru(bloklar[k], k + ' bloğu bulunamadı');
    esit(crypto.createHash('sha256').update(bloklar[k], 'utf8').digest('hex'), beklenen[k], k + ' özeti');
  }
});

await test('Önizleme sitesinin ihtiyaç duyduğu işaretler yerinde', async () => {
  dogru(html.includes("const KEY = 'teftis_prog_v2', KEY1 = 'teftis_prog_v1';"), 'KEY tanımı değişmiş (tools/site-olustur.mjs de güncellenmeli)');
  dogru(html.includes("const IDB_AD = 'teftis_db'"), 'IDB_AD tanımı değişmiş (tools/site-olustur.mjs de güncellenmeli)');
  dogru(/<body[^>]*>/.test(html), '<body> etiketi yok');
});

await test('Program hatasız açılıyor ve ana ekran görünüyor', async () => {
  const { ctx, p } = await yeniSayfa();
  dogru((await p.innerText('#icerik')).includes('Programlı Teftiş'), 'ana ekran metni yok');
  esit(p.hatalar.length, 0, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await ctx.close();
});

await test('Excel görev listesi yükleniyor (2 işyeri)', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 800);
  const d = await DB(p);
  esit(d.isyerleri.length, 2, 'işyeri sayısı');
  dogru(d.isyerleri[0].kunye.isveren.includes('ÖRNEK GIDA'), 'işveren unvanı okunmadı');
  esit(p.hatalar.length, 0, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await ctx.close();
});

await test('CSV (Windows Türkçe, noktalı virgül) yükleniyor', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('liste.csv')); await bekle(p, 800);
  const d = await DB(p);
  esit(d.isyerleri.length, 1, 'işyeri sayısı');
  esit(d.isyerleri[0].gorevler[0].adres.includes('Şişli'), true, 'Türkçe karakter / tırnak içi ayraç');
  esit(d.isyerleri[0].gorev.mufettisler[2] && d.isyerleri[0].gorev.mufettisler[2].ad, 'Zeynep ÖZ', '3. müfettiş');
  await ctx.close();
});

await test('PDF görev listesi okunuyor (standart ve kaymış sütun)', async () => {
  for (const f of ['gorev_std.pdf', 'gorev_kayik.pdf']) {
    const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
    await p.setInputFiles('#pdfGorev', ORNEK(f)); await p.waitForFunction(() => document.querySelector('.tamam'), null, { timeout: 15000 });
    const d = await DB(p);
    esit(d.isyerleri.length, 2, f + ' işyeri sayısı');
    dogru(d.isyerleri.every(w => w.kunye.isveren && w.gorevler[0].adres), f + ': unvan/adres boş');
    esit(d.isyerleri[0].gorev.mufettisler.filter(m => m.ad).length, 3, f + ' müfettiş sayısı');
    await ctx.close();
  }
});

await test('Okunamayan PDF için açıklayıcı mesaj veriliyor', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#pdfGorev', ORNEK('metinsiz.pdf')); await p.waitForFunction(() => document.querySelector('.tamam'), null, { timeout: 15000 });
  dogru((await mesaj(p)).includes('Taranmış'), 'metinsiz PDF mesajı: ' + await mesaj(p));
  await p.setInputFiles('#pdfGorev', ORNEK('baska.pdf')); await bekle(p, 1500);
  dogru((await mesaj(p)).includes('SGK sicil numarası bulunamadı'), 'başka PDF mesajı: ' + await mesaj(p));
  await ctx.close();
});

await test('Tüm tespitler işaretlenip 5 belge Word olarak üretiliyor', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 800);
  await p.click('[data-act=ac] >> nth=0'); await bekle(p);
  await p.click('.rail-i[data-t=as1]'); await bekle(p);
  const sekmeler = await p.$$eval('[data-tb]', x => x.map(e => e.dataset.tb));
  let sayac = 0, i = 0;
  for (const tb of sekmeler) {
    await p.click('[data-tb="' + tb + '"]'); await bekle(p, 150);
    const idler = await p.$$eval('[data-ds][data-dv=aykiri]', x => x.map(e => e.dataset.ds));
    for (const id of idler) { await p.click('[data-ds="' + id + '"][data-dv="' + (i++ % 4 === 3 ? 'uygun' : 'aykiri') + '"]'); sayac++; }
  }
  dogru(sayac >= 60, 'işaretlenen tespit sayısı az: ' + sayac);
  const adimlar = [['as1', 'tut1'], ['evrak', 'evrak'], ['nok', 'nok'], ['as2', 'tut2'], ['rapor', 'rap']];
  for (const [adim, kod] of adimlar) {
    await p.click('.rail-i[data-t=' + adim + ']'); await bekle(p, 300);
    dogru(!(await p.$('.uyari2')), kod + ': "Belge hazırlanırken hata" kutusu çıktı: ' + (await p.$eval('.uyari2', e => e.innerText).catch(() => '')));
    const metin = await docxMetin(p, await indir(p, kod));
    dogru(metin.length > 500, kod + ' belgesi çok kısa');
    dogru(!/undefined|NaN|\[object Object\]/.test(metin), kod + ' belgesinde "undefined/NaN" var: ' + (metin.match(/.{0,40}(undefined|NaN|\[object Object\]).{0,40}/) || [''])[0]);
  }
  esit(p.hatalar.length, 0, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await ctx.close();
});

await test('Müfettiş eklenip kaldırılabiliyor, imza tablosuna yansıyor', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 800);
  await p.click('[data-act=ac] >> nth=0'); await bekle(p);
  await p.click('[data-act=mufEkle]'); await bekle(p);
  await p.fill('[data-p="gorev.mufettisler.2.ad"]', 'Can ER'); await bekle(p, 400);
  await p.click('.rail-i[data-t=as1]'); await bekle(p);
  dogru((await docxMetin(p, await indir(p, 'tut1'))).includes('Can ER'), '3. müfettiş tutanakta yok');
  await p.click('.rail-i[data-t=gorev]'); await bekle(p);
  await p.click('[data-act=mufSil][data-i="2"]'); await bekle(p);
  esit((await DB(p)).isyerleri[0].gorev.mufettisler.length, 2, 'kaldırma sonrası müfettiş sayısı');
  await ctx.close();
});

await test('Yedek alınıp geri yükleniyor; eski biçimli yedek programı bozmuyor', async () => {
  const { ctx, p } = await yeniSayfa(); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 800);
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=yedekAl] >> nth=0')]);
  const yedek = path.join(GECICI, 'yedek.json'); await d.saveAs(yedek);
  dogru((await DB(p)).sonYedek, 'son yedek tarihi tutulmadı');
  await p.setInputFiles('#yedekAc', ORNEK('eski_yedek.json')); await bekle(p, 600);
  esit((await DB(p)).isyerleri.length, 1, 'eski yedek işyeri sayısı');
  await p.click('[data-act=ac] >> nth=0'); await bekle(p);
  await p.click('.rail-i[data-t=as1]'); await bekle(p);
  dogru(await p.$('[data-act=indir][data-k=tut1]'), 'eski yedekteki işyerinde tutanak adımı açılmadı');
  await listeyeGit(p);
  await p.setInputFiles('#yedekAc', yedek); await bekle(p, 600);
  esit((await DB(p)).isyerleri.length, 2, 'yeni yedek geri yükleme');
  esit(p.hatalar.length, 0, 'sayfa hatası: ' + p.hatalar.join(' | '));
  await ctx.close();
});

await test('Tarayıcı deposu dolarsa veriler ikinci depoda korunuyor', async () => {
  const lsKir = () => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (/^teftis_/.test(k)) throw new DOMException('dolu', 'QuotaExceededError'); return o.call(this, k, v); }; };
  const { ctx, p } = await yeniSayfa({}, lsKir); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 1200);
  dogru(!(await p.$('#kayitUyari')), 'gereksiz kırmızı uyarı çıktı');
  await p.reload(); await p.waitForFunction(() => window.__teftis); await bekle(p, 1200);
  esit((await DB(p)).isyerleri.length, 2, 'yenileme sonrası işyeri sayısı');
  await ctx.close();
});

await test('Hiçbir depoya yazılamazsa kırmızı uyarı çıkıyor', async () => {
  const kir = () => { Storage.prototype.setItem = function () { throw new DOMException('dolu', 'QuotaExceededError'); }; window.indexedDB.open = function () { throw new Error('yok'); }; };
  const { ctx, p } = await yeniSayfa({}, kir); await listeyeGit(p);
  await p.setInputFiles('#xlsDosya', ORNEK('dolu.xlsx')); await bekle(p, 1200);
  dogru(await p.$('#kayitUyari'), 'kırmızı uyarı çıkmadı');
  await ctx.close();
});

await test('Telefon ekranında menü görünüyor, sayfa yana taşmıyor', async () => {
  const { ctx, p } = await yeniSayfa({ viewport: { width: 390, height: 844 } });
  dogru(await p.isVisible('.topnav'), 'üst menü gizli');
  esit(await p.evaluate(() => document.documentElement.scrollWidth), 390, 'sayfa genişliği');
  await ctx.close();
});

await tarayici.close();
fs.rmSync(GECICI, { recursive: true, force: true });
console.log('\n' + gecen + ' test geçti' + (kalan ? ', ' + kalan + ' test BAŞARISIZ: ' + hatalar.join('; ') : '') + '.\n');
process.exit(kalan ? 1 : 0);
