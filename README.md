# Teftiş Otomasyon Sistemi

Programlı teftiş belgelerini (evrak isteme, 1. ve 2. aşama tutanak, noksanlıklar ve aykırılıklar bildirimi, rapor) hazırlayan, tarayıcıda çalışan tek dosyalık program.

**Çevrimiçi kullanım:** https://onurcoskun616.github.io/teftis/

## Nasıl çalışır

1. **Görev listesi:** Excel şablonunu indirip doldurun veya Bakanlık görev listesi PDF'ini yükleyin. İşyerleri otomatik ayrılır ve listelenir.
2. **İşyeri bazında çalışma:** Her işyeri 7 adımda ilerler: Görev ve künye → İşçi ifadeleri → Evrak isteme → 1. Aşama tutanak → Noksanlık bildirimi → 2. Aşama tutanak → Rapor.
3. **Tespitler:** Her konu için *Yazılmasın / Yasaya uygun / Aykırı* seçilir. Hazır ibare ve yasal dayanak katalogdan gelir, açıklamanızı eklersiniz.
4. **Çıktı:** Her belge Word (.docx) olarak indirilir. Sarı (köşeli parantezli) alanlar Word'de tamamlanır.

## Veriler nerede saklanır?

Girilen tüm bilgiler **yalnızca kullanılan bilgisayarın tarayıcısında** (localStorage) tutulur, hiçbir sunucuya gönderilmez. Bu depoda yalnızca programın kendisi bulunur, işyeri veya kişi bilgisi bulunmaz.

- Farklı bilgisayar veya tarayıcıda veriler görünmez. Taşımak için ana ekrandaki **Tüm verileri yedekle / Yedekten yükle** kullanılır.
- Tarayıcı verilerini temizlemek kayıtları siler. Düzenli yedek alın.

## Çevrimdışı kullanım

`index.html` dosyasını indirip çift tıklayarak internetsiz de çalıştırabilirsiniz. Tüm kütüphaneler (docx, JSZip, PDF.js) dosyanın içindedir.

## Geliştirme

- Program tek dosyadır: `index.html`. `main` dalına yapılan her değişiklik birkaç dakika içinde çevrimiçi linke yansır.
- Değişiklik geçmişi için [CHANGELOG.md](CHANGELOG.md) ve commit geçmişine bakın.
- Hata ve istekler için **Issues** sekmesini kullanın.
