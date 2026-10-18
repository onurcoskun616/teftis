# Teftiş Otomasyon Sistemi — Claude için çalışma rehberi

Bu depo, iş müfettişlerinin programlı teftiş belgelerini (evrak isteme, 1. ve 2. aşama tutanak, noksanlıklar ve aykırılıklar bildirimi, rapor) hazırladığı tarayıcı programıdır. Programı **kullanan müfettişler** claude.ai/code üzerinden seninle konuşarak geliştirir. Onlar yazılımcı değildir.

## Kullanıcıyla nasıl konuşulur

- Her zaman **Türkçe**, sade ve kısa yaz. "Commit, branch, merge, DOM, regex" gibi terimler kullanma; gerekiyorsa "kayıt", "deneme sürümü", "yayına alma" de.
- İşe başlamadan önce isteği **bir iki cümleyle** kendi sözlerinle tekrar et. İstek iki farklı şekilde anlaşılabiliyorsa ya da mevcut bir davranışı değiştirip başka müfettişleri etkileyecekse kısa bir soru sor; açıksa doğrudan başla.
- Bir oturumda **tek konu** üzerinde çalış. Kullanıcı birden fazla şey isterse sırayla yap ama her birini ayrı ayrı anlat.
- Bitirdiğinde şunları söyle: ne değişti (kullanıcının göreceği şekilde), önizleme linki, nasıl deneyeceği, onaydan sonra herkes için yayına gireceği.

## Depo yapısı

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Programın tamamı (≈3,7 MB, tek dosya, internetsiz çalışır). Canlı sürüm budur. |
| `CHANGELOG.md` | Kullanıcı diliyle sürüm geçmişi. Her değişiklikte güncellenir. |
| `tests/e2e.mjs` | Uçtan uca testler (`npm test`). |
| `tests/ornekler/` | Testlerin kullandığı **tamamen kurgusal** örnek dosyalar. |
| `tests/kutuphane-ozet.json` | Hazır kütüphanelerin özetleri (değiştirilmediklerini doğrular). |
| `tools/site-olustur.mjs` | GitHub Pages sitesini (canlı sürüm + önizlemeler) oluşturur. |
| `gelistir/index.html` | Müfettişlerin gördüğü geliştirici sayfası. |
| `.github/workflows/` | Testler ve site dağıtımı. |

### `index.html` içindeki `<script>` blokları (sırasıyla)

1. **JSZip** (`/*! JSZip v3.10.1`) — hazır kütüphane, **DOKUNMA**.
2. **docx** (`var docx = (function(exports)`) — Word üretici, **DOKUNMA**.
3. `window.__CAT__=[…]` — **tespit kataloğu** (JSON, tek satır). Her tespit: `id, bolum, grup, ad, varyantlar, dayanak[], ipc, ipcYok, noksanBaslik, aykiriLead, uygunLead, noksanTespit, duzeltme, giderildi, taslak, sira…`
4. `window.__MEV__={…}` — mevzuat metinleri (4857 sayılı Kanun + 8 yönetmelik), katalogdaki "mevzuattan tespit üret" için.
5. `MEVLIB` — mevzuat yardımcıları.
6. **Ana program** — `/* Programlı Teftiş Belge Programı v3` ile başlar. Değişikliklerin neredeyse tamamı burada yapılır.
7. `pdfjsLibSrc`, `pdfjsWorkerSrc` (`type="text/plain"`) — PDF.js, **DOKUNMA**.

Hazır kütüphaneler değişirse `npm test` başarısız olur. Bilerek güncelleniyorsa `tests/kutuphane-ozet.json` da güncellenmeli (bunu yalnızca yönetici isterse yap).

### Ana programda önemli yerler (ara: Grep)

- `katalogDuzelt` ve `ekTespitler` — katalog JSON'una kod içinden eklenen/düzeltilen tespitler. **Yeni tespit eklemenin önerilen yolu** `ekTespitler` içine `BASE.push(Object.assign({}, tm, {...}))` ile eklemektir (örnekler orada). `dogrudan: true` = noksanlık bildirimine girmez, rapora doğrudan idari işlem olarak geçer.
- `CEZA_TABLO`, `CEZA_ORAN` — yıllara göre idari para cezası tutarları ve yeniden değerleme oranları. Yeni yıl için `CEZA_ORAN`'a oran eklemek yeterli; tabloda olmayan yıl son yıldan hesaplanır.
- `tutanak1`, `noksanlik`, `tutanak2`, `evrak`, `rapor` — belgelerin içeriği (blok listesi döndürür; `P`, `J` paragraf yardımcıları).
- `madde1`, `genelIstatistik`, `kdCumlesi` — tutanağın 1. maddesi.
- `xlsOku`, `xlsGorevler`, `csvOku`, `xlsEskiOku`, `gorevPdfOku` — görev listesi okuma (Excel/CSV/PDF).
- `yeniDB`, `yeniIsyeri`, `normalizeDB` — veri yapısı. **Yeni bir alan eklersen** varsayılanını `yeniIsyeri`/`yeniDB`'ye koy; `normalizeDB` eski kayıtları otomatik tamamlar.
- `kaydet`, `kaydetSimdi`, `idbdenYukle` — kayıt (localStorage + IndexedDB).
- `ciz` ve `ekran…`/`adim…` fonksiyonları — ekranlar. Tıklamalar `data-act` ile tek bir olay dinleyicisinde işlenir.
- `window.__teftis` — testlerin kullandığı iç erişim; kaldırma.

## Değişmez kurallar

1. **Kullanıcı verisini koru.** `const KEY = 'teftis_prog_v2'`, `KEY1` ve `const IDB_AD = 'teftis_db'` satırlarını değiştirme: müfettişlerin tüm kayıtları bu anahtarlarda. (Önizleme aracı da bu satırları arar.) Veri yapısını değiştiriyorsan eski kayıtların açılmaya devam ettiğinden emin ol.
2. **Gerçek belge ve kişisel veri depoya girmez.** Kullanıcının oturuma eklediği görev emri, tutanak, ifade, ekran görüntüsü gibi dosyaları **asla** depoya ekleme, test örneği yapma, kod ya da yorum içine kopyalama. Depo herkese açıktır. Test için gerekirse kurgusal ad, adres ve numaralarla yeni örnek üret (`tests/ornekler/`).
3. **Mevzuat metni uydurma.** Kanun/yönetmelik metnini, madde numarasını ya da ceza tutarını ezberden yazma. Kullanıcının verdiği belgeden ya da resmi kaynaktan doğrula. Doğrulayamadığın kısmı `…` ile kısalt, tespite `taslak: true` koy ve kullanıcıya hangi kısmın kontrol edilmesi gerektiğini söyle.
4. **Hukuki dil.** Tutanak cümleleri mevcut kalıplara uymalı: tespitler "…olduğu tespit edilmiştir / görülmüştür / anlaşılmıştır", madde sonları ";" ya da "," ile. Yeni metin yazarken katalogdaki benzer bir tespiti örnek al. Köşeli parantez `[…]` = müfettişin dolduracağı alan (belgede sarı işaretlenir).
5. **Tek dosya kalır.** Programı dosyalara bölme, dışarıdan (CDN) zorunlu kütüphane ekleme; program internetsiz çalışmalı. (İsteğe bağlı ve internet yoksa düzgün hata veren yükleme kabul edilebilir; bkz. `xlsEskiOku`.)
6. **Doğrudan yayına alma.** `main` dalına doğrudan gönderme yapma; her değişiklik ayrı bir dalda olur ve yönetici onayıyla yayına girer.

## Dosyayı düzenleme yöntemi

- `index.html` çok büyük ve bazı satırları yüz binlerce karakter. **Dosyanın tamamını okumaya çalışma.** Grep ile yeri bul (`-o` ve kısa bağlamla), sonra Edit aracıyla benzersiz bir metin parçasını değiştir.
- Katalog JSON'u tek satırdadır; oradaki bir tespiti değiştirmek yerine `katalogDuzelt`/`ekTespitler` içinde kodla düzeltmek daha güvenlidir (`const by = id => BASE.find(c => c.id === id)` kalıbı).
- Python ile değiştirme yapacaksan eski metnin dosyada **tam olarak bir kez** geçtiğini kontrol et.

## İş akışı (her istek için)

1. İsteği anla, gerekirse sor. Kullanıcı belge eklediyse oku ve isteğin hangi kısmını etkilediğini belirle.
2. Değişikliği yap.
3. **Test et:** `npm test`. Hepsi geçmeden bitirme. Yeni bir özellik eklediysen `tests/e2e.mjs`'e onu kontrol eden kısa bir test ekle.
   - `playwright` bulunamazsa: `npm install` (gerekirse `npx playwright install chromium`). Kurulum yapılamıyorsa bunu kullanıcıya söyle; GitHub'daki otomatik testler yine çalışır.
   - Belgeyle ilgili bir değişiklikse ilgili Word çıktısını üretip metnini kontrol et (testlerdeki `docxMetin` yardımcısı örnek).
4. **CHANGELOG.md**'nin en üstüne yeni sürüm ekle: `## vX.Y — GG.AA.YYYY` ve kullanıcı diliyle 1–5 madde (ne değişti, müfettiş bunu nerede görür). Küçük düzeltme: ikinci sayı +1 (v8.1 → v8.2); büyük özellik: ilk sayı +1.
5. Değişiklikleri kaydet ve dalı GitHub'a gönder. Kayıt mesajı Türkçe ve sürüm numarasıyla başlasın: `v8.2: …`.
6. Pull request açılmasını sağla (açma imkânın varsa sen aç; yoksa kullanıcıya oturumdaki "PR oluştur / Create PR" düğmesine basmasını söyle). Başlık Türkçe, açıklamada: ne değişti, nasıl denenir, önizleme linki.
7. Kullanıcıya **önizleme linkini** ver: `https://onurcoskun616.github.io/teftis/onizleme/<dal>/`. `<dal>`: dal adı küçük harfe çevrilip harf/rakam/`.`/`_`/`-` dışındaki karakterler `-` yapılır (ör. `claude/fazla-calisma` → `claude-fazla-calisma`). Önizleme, testler geçtikten sonra **5–10 dakika** içinde hazır olur; geliştirici sayfasındaki "Açık önizlemeler" listesinde de görünür: `https://onurcoskun616.github.io/teftis/gelistir/`.
8. Kullanıcıya önizlemede deneyip sorun varsa aynı oturuma yazmasını, sorun yoksa yöneticiye haber vermesini söyle.

## Önizleme ve yayın nasıl çalışır (bilgi)

- `.github/workflows/test.yml`: her gönderimde testler. Geçerse ve dal `main` değilse site yeniden oluşturulur.
- `.github/workflows/site.yml`: `tools/site-olustur.mjs` ile siteyi kurar: kök = `main` (canlı), `onizleme/<dal>/` = her dal. Önizlemeler ayrı depolama anahtarı kullanır ve üstte sarı "ÖNİZLEME" bandı gösterir; gerçek verilere dokunmaz.
- Yönetici pull request'i onaylayıp birleştirdiğinde canlı sürüm birkaç dakika içinde güncellenir. Dal silinince önizlemesi de kalkar.
