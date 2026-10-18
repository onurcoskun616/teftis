# Teftiş Otomasyon Sistemi

Programlı teftiş belgelerini (evrak isteme, 1. ve 2. aşama tutanak, noksanlıklar ve aykırılıklar bildirimi, rapor) hazırlayan, tarayıcıda çalışan tek dosyalık program.

**Çevrimiçi kullanım:** https://onurcoskun616.github.io/teftis/

## Nasıl çalışır

1. **Görev listesi:** Excel şablonunu indirip doldurun veya Bakanlık görev listesi PDF'ini yükleyin. İşyerleri otomatik ayrılır ve listelenir.
2. **İşyeri bazında çalışma:** Her işyeri 7 adımda ilerler: Görev ve künye → İşçi ifadeleri → Evrak isteme → 1. Aşama tutanak → Noksanlık bildirimi → 2. Aşama tutanak → Rapor.
3. **Tespitler:** Her konu için *Yazılmasın / Yasaya uygun / Aykırı* seçilir. Hazır ibare ve yasal dayanak katalogdan gelir, açıklamanızı eklersiniz.
4. **Çıktı:** Her belge Word (.docx) olarak indirilir. Sarı (köşeli parantezli) alanlar Word'de tamamlanır.

## Veriler nerede saklanır?

Girilen tüm bilgiler **yalnızca kullanılan bilgisayarın tarayıcısında** tutulur, hiçbir sunucuya gönderilmez. Kayıt hem tarayıcının küçük deposuna (localStorage, ~5 MB) hem de büyük veritabanına (IndexedDB) yazılır; küçük depo dolsa da kayıt devam eder. İkisine birden yazılamazsa ekranın üstünde kırmızı uyarı çıkar. Bu depoda yalnızca programın kendisi bulunur, işyeri veya kişi bilgisi bulunmaz.

- Farklı bilgisayar veya tarayıcıda veriler görünmez. Taşımak için **Tüm verileri yedekle / Yedekten yükle** kullanılır (ana ekranda ve işyeri listesinin altında).
- Tarayıcı verilerini temizlemek kayıtları siler. 7 günden uzun süre yedek alınmazsa program uyarır.

## Görev listesi yükleme

- **Excel (.xlsx)** şablonu, **CSV** (`;`, `,` veya sekme ayraçlı; UTF-8 veya Windows Türkçe) ve **eski Excel (.xls)** kabul edilir. .xls okumak için internet bağlantısı gerekir.
- **Bakanlık görev listesi PDF'i**: SGK sicil numaraları ve "Unvan:/Adres:" satırlarından okunur. Okunamazsa nedenini söyler (taranmış belge, SGK numarası yok vb.).
- Müfettiş sayısı sınırsızdır; Excel'de "Müfettiş 3 …" sütunu isteğe bağlıdır.

## Çevrimdışı kullanım

`index.html` dosyasını indirip çift tıklayarak internetsiz de çalıştırabilirsiniz. Tüm kütüphaneler (docx, JSZip, PDF.js) dosyanın içindedir.

## Geliştirme

Programı kullanan müfettişler, kendi Claude hesaplarıyla (Pro, Max veya Team) **claude.ai/code** üzerinden programı geliştirebilir. Adımlar ve açık önizlemeler: **https://onurcoskun616.github.io/teftis/gelistir/**

- Claude, depodaki `CLAUDE.md` rehberine göre çalışır: değişikliği ayrı bir dalda yapar, `npm test` ile test eder, `CHANGELOG.md`'yi günceller.
- Her dal için gerçek verilerden ayrı saklanan bir önizleme oluşur: `https://onurcoskun616.github.io/teftis/onizleme/<dal>/`
- Değişiklik, yönetici pull request'i onaylayınca canlı sürüme geçer.
- Testleri yerelde çalıştırmak için: `npm install && npx playwright install chromium && npm test`
- Hata ve istekler için **Issues** sekmesi de kullanılabilir.
