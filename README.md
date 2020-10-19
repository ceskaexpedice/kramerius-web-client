# Kramerius 6 - klient pro uživatelské rozhraní

## NK

Napojení na PDF server
Napojení na DNNT Kramerius (odkaz na příhlášení)
Barevná úprava
Pokud je název díla delší než 60 znaků - zobrazí se jako title
OCR chybová hláška - pomocí časování se zobrazí chybová hláška, pokud se OCR nepovede načíst
Nastavení roku 1612 u filtru
Úprava hodnoty PDF stránek ze 100 na 60
Citace - odstranění napojení na externí API
Modifikace přihlášení pro potřeby NDK


## Obecné

PDF generování - při výběru stránek se zobrazuje počet vybraných
Implementace stránky s patičkou
možnost informativní hlášky v hlavičce - nastavuje se pomocí "notice: ''"
showMetadata / showCitation / showSharing /... hodnoty: public, always
přidání animace načítání klienta
Opraven problém s HTML entity (&lt; &gt; &quot; &apos;) v režimu procházet
Změna linku na stahování obrázků (možno vytisknout obě strany zároveň)
Pokud je dokument nedostupný - nezobrazí se lišta s funkcemi (výběr, otočení,..)
