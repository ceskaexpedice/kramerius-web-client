# KrameriusClient

## the latest tasks
- PETR | DONE -> predelat taby na ng2-materialize
- PETR | DONE -> tlacitko vstupte -> 2 stavy: neni dotaz = sipka + vstupte, je dotaz = lupa + hledej (stejne ho prekryva                        naseptavani)
- PETR | DONE udelat 2 komponenty search baru pro home page a pro result+dalsi
- PETR | DONE -> dodelat casovou osu + kalendar - collapse z toolbaru
- PETR | DONE -> zakomentovat pocet zaznamu z toolbaru
- PETR | DONE -> opravit toolbar -> border + active bootom line
- PETR | DONE -> filtry - pokud je vysledek hledani 0, filtry nezobrazit + pokud konretni filtr vraci 0, take skryt
- PETR | DONE -> aktivni filtry - pridat ikony
- PETR | DONE -> upravit zamecek na nahledech
- PETR | DONE -> pridat alerts, pokud je vysledek 0 + pripadne dalsi stavy, ktere si rekneme napr. kdyz vypadne API
- PETR | DONE -> loga knihoven - otestovat a vymyslet reseni viz. email od Pavla - otestovano, po odsouhlaseni nasadim vcetne                    home page

- HONZA -> u filtru "dostupnost" mi nevraci searchService.accessibility?.length nulu, pokud nejsou zadne vysledky, cili ho v              pripade 0 vysledku nemuzu skryt
- HONZA -> filtr "dostupnost" by se dle meho mel chovat jako ostatni, cili zvoleny by mel zmizet, polozku "all" bych zrusil,              protoze pokud nebude zadane zadne omezeni u dostupnosti, tak ze bude zobrazovat vse stejne jako v pripade ostatnich            filtru
- HONZA -> alerts - definovat a pripadne zakomponovat, jake vsechny stavy mohou behem hledani nastat (napr. vypadek API) +                upravit podminku, kdy se zobrazuje alert na vysledek 0 - zde by to chtelo zobrazit alert box az na konci cyklu pokud            to pujde, aby neproblikaval pred vykraslenim vysledku -> http://localhost:4200/search?q=sdfsadfasdf&ordering=newest
- HONZA -> home page - dodelat funkcionalitu slideru - 2 radky + sipky, vzhled doladim, staci jen udelat funkcionalitu
- HONZA -> v prohlizecce zobrazit dvojstranu - (pavluv koment) + sipky na listovani po jednotlivych strankach pravo/vlevo
- HONZA -> sipka zpet v navbaru, stejne jako to mas u sveho soucasneho klienta
- HONZA -> dodelat collections, browse a o cem dalsim vi

## to the end
- PETR -> responsivni chovani -> pri zmensenem okne horni casti doctype facety zmizi a zobrazi se standardne v levem facetovem sloupci
