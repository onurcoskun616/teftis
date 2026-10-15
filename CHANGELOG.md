# Değişiklik geçmişi

## v8.1 — 15.10.2026
Veri güvenliği ve kullanım kolaylığı:

1. **Kayıt artık sessizce kaybolmuyor.** Veriler localStorage'a ek olarak IndexedDB'ye de yazılıyor (çok daha büyük alan). İkisine de yazılamazsa ekranın üstünde kırmızı "Veriler kaydedilemiyor" uyarısı ve yedekle düğmesi çıkıyor. Sayfa kapatılırken bekleyen kayıt hemen yazılıyor.
2. **Yedekten yükleme düzeltildi.** Eski sürümden alınan yedekler artık programı bozmuyor (eksik alanlar tamamlanıyor). Yanlış dosya seçilirse açık uyarı veriyor; yüklemeden önce yedekteki işyeri sayısını gösteriyor.
3. **Yedek hatırlatma.** Son yedek tarihi tutuluyor; 7 günü geçince ya da hiç alınmamışsa ana ekranda ve işyeri listesinde uyarı çıkıyor. Kayıtlı veri boyutu gösteriliyor. Yedek düğmeleri işyeri listesinin altına da eklendi.
4. **PDF görev listesi daha esnek.** SGK numarası noktalı/boşluklu yazılmış olsa da tanınıyor; "Unvan/Adres" sütunu sayfada farklı konumdaysa kendiliğinden bulunuyor. Okunamazsa nedenini söylüyor (taranmış belge, SGK numarası yok). Unvan veya adresi okunamayan satırlar için uyarı veriyor.
5. **Dar ekranda menü.** Telefon ve tablette üst menü artık gizlenmiyor.
6. **Müfettiş sayısı sınırsız.** "+ Müfettiş ekle" / "kaldır" düğmeleri; imza tabloları ve sayılar buna göre oluşuyor. Excel şablonuna isteğe bağlı "Müfettiş 3" sütunları eklendi; PDF'ten 3. müfettiş de okunuyor.
7. **CSV ve .xls yükleme.** CSV (`;` `,` sekme; UTF-8 veya Windows Türkçe) doğrudan okunuyor. Eski .xls dosyaları internet varken okunuyor, yoksa ne yapılacağını söylüyor. Bozuk .xlsx için açıklayıcı mesaj.

## v8.0 — 15.10.2026
Yeni tespit maddeleri (katalog 64 → 71 madde, 3 yeni sekme):

- **Kayıt dışı istihdam ve yabancı çalıştırma** (yeni sekme, doğrudan idari işlem):
  - Sigortasız işçi çalıştırılması (5510 md. 8). Raporda SGK'ya bildirim cümlesiyle çıkar.
  - Çalışma izni olmaksızın yabancı çalıştırılması / bildirim yükümlülüğüne aykırılık (6735 md. 23/5). 2025–2026 ceza tutarları tabloda.
- **İş sözleşmesinin sona ermesi** (yeni sekme):
  - Yeni iş arama izni verilmemesi (4857 md. 27, ceza öngörülmemiş).
  - Toplu işçi çıkarma usulüne uyulmaması (4857 md. 29 / 100, doğrudan idari işlem, 2023–2025 tutarları tabloda).
- **Diğer yükümlülükler:** İşyeri bildirimi (4857 md. 3 / 98).
- **Çocuk, genç ve kadın işçiler:**
  - Kadın çalışanların gece postalarında çalıştırılması: 7,5 saat, servis, sağlık raporu, gebe/emziren yasağı (Yönetmelik md. 5, 6, 7, 9; ceza 4857 md. 104).
  - Emzirme odası / çocuk bakım yurdu kurulmaması (Yönetmelik md. 13).
- Tutanağın 1. maddesindeki "…yabancı uyruklu işçiye … sigortasız olarak çalışan işçiye rastlanmadığı" kalıbı, ilgili tespit "Aykırı" işaretlendiğinde kendiliğinden düzeltiliyor; çelişkili tutanak çıkmıyor.

**Doğrulanması gerekenler** (katalogda "Dayanak taslak" etiketiyle işaretli): 5510, 6735 ve iki yönetmelik metninin resmi kaynağa erişilemediği için yalnızca doğrulanabilen kısımları "…" ile alıntılandı. İşyeri bildirimi (md. 98) için güncel yıllık tutar tabloda yok. Emzirme odası maddesinin idari yaptırım dayanağı (6331) belirlenmeli.

## v7.9 — 15.10.2026
- Programdaki kişi adı kaldırıldı. Program adı ve alt başlık **Belge ayarları → Program adı ve varsayılanlar** bölümünden değiştirilebilir.
- Yeni işyerlerine otomatik yazılan "İzmir Rehberlik ve Teftiş Grup Başkanlığı" ve "Motorlu Kara Taşıtları… Programlı Teftişi" varsayılanları kaldırıldı. Görevlendiren makam ve programlı teftiş adı artık ayarlardan belirleniyor. Boş bırakılırsa belgede sarı köşeli alan olarak çıkıyor.
- Müfettiş adı biçimi örneği genelleştirildi.

## v7.8
- İlk yükleme (mevcut program).
