import { SolrService } from './../services/solr.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../services/page-title.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DocumentItem } from '../model/document_item.model';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit {

  uuid: string;

  title = 'Mollova mapová sbírka';
  subcollections = [];
  documents: DocumentItem[] = [];

  constructor(private pageTitle: PageTitleService,
              private route: ActivatedRoute,
              private api: KrameriusApiService,
              private solr: SolrService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.subcollections = [];
      this.documents = [];
      this.uuid = params.get('uuid');
      this.init();
    });
  }

  init() {
    console.log('init', this.uuid);
    if (this.uuid === 'moll') {
      this.pageTitle.setTitle(null, 'Mollova mapová sbírka');
      this.title = 'Mollova mapová sbírka';
      this.subcollections.push({
        title: 'Atlas Austriacus',
        uuid: 'austriacus',
        desc: 'Rakouský atlas tak obsahuje čtyři základní celky - vlastní rakouské země spolu se zeměmi českými, Burgundský kraj (tedy Spojené nizozemské provincie a Rakouské Nizozemí), mapy Itálie a nakonec mapy Uher, označované také jako Uherský atlas.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/045/140/2619265500/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Atlas Germanicus',
        uuid: 'germanicus',
        desc: 'Atlas Germanicus je rozdělen na kraje Bavorský, Francký, Hornorýnský, Dolnorýnský, Hornosaský, Dolnosaský, Švábský a Vestfálský. V posledním svazku jsou uloženy mapy Švýcarska',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/053/762/2619316974/thumb_for_maps.jpg'
      });
    } else if (this.uuid === 'austriacus') {
      this.pageTitle.setTitle(null, 'Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'Atlas Austriacus';
      this.subcollections.push({
        title: 'Rakouský kraj',
        uuid: 'rakousky-kraj',
        desc: 'Největší ze souborů celého Mollova atlasu je věnován grafické a mapové tvorbě zobrazující území rakouských dědičných zemí. Používané geografické názvy vycházejí z vnitřního členění rakouských zemí v raném novověku na Dolní Rakousko (Dolní a Horní Rakousy), Horní Rakousko (Tyrolsko a Vorarlberg), Vnitřní Rakousko (Štýrsko, Korutany, Kraňsko), Přední Rakousko (habsburská území ve Švábsku, Bavorsku a dnešním Švýcarsku). Jednotlivé země se pak členily do historických čtvrtí. Obsah jednotlivých svazků je rozepsán níže.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/045/140/2619265500/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'České země',
        uuid: 'ceske-zeme',
        desc: 'Mapy a grafiky Čech, Moravy a Slezska představují asi jedinou část sbírky, které byla během 19. a 20. století věnována pozornost. Srovnání s původním stavem bohužel ukazuje na značné ztráty, částečně došlo i k doplňování souboru. Současná podoba tedy neodpovídá stavu z doby vzniku, i tak však dosud obsahuje řadu zajímavých děl. Přestože Mollův atlas vznikl až v 40. a 50. letech, zahrnuje území celého Slezska, včetně knížectví ztracených po válkách o rakouské dědictví. Podobně jako části věnované rakouským zemím a Uhrám je doplněn o řadu kreseb autora či dílny používající siglu Geyer, která zobrazují důlní díla a antické památky. V mapografických katalozích jsou tato vyobrazení doplněna obšírnými komentáři, zaslanými Mollovi znalci místních poměrů (z Moravy např. Dismasem Josefem Ignácem von Hoffer). Pozornost si zasluhuje i rozsáhlý soubor různých tiskových variací Komenského mapy Moravy.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/036/786/2619267299/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Burgundský kraj',
        uuid: 'burgundsky-kraj',
        desc: 'Burgundský kraj zahrnoval dvě základní území - katolické Rakouské Nizozemí (zhruba dnešní Belgii a část Francie) a protestantské Spojené nizozemské provincie (zhruba dnešní Nizozemí). Území bylo v raném novověku jedním z hlavních center evropské kartografie, soubor dobře dokumentuje mapovou tvorbu všech hlavních dílen v této oblasti. Vedle nich obsahuje i řadu vedut měst, vodních kanálů, paláců a zahrad.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/045/580/2619267725/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Itálie',
        uuid: 'italie',
        desc: 'Itálie byla během 18. století stále rozdrobena do množství malých států. Tehdejší administrativní členění respektuje i struktura Mollovy sbírky. Sardinské království tak zahrnuje i pevniskou kolébku tamní dynastie - Savojsko a Piemont, Benátsko obsahuje velkou část dalmatského pobřeží. Větší Milánsko tvoří samostatnou signaturu, ostatní menší územní celky v severní Itálii jsou sloučeny dohromady. Střední Itálie je zahrnuta pod Církevní státem, tyto oddíly obsahují i řadu mědirytinových rytin Říma. Poslední oddíly jsou věnovány Toskánsku a Neapolsko-sicilskému království. Zvláště v signaturách zobrazujících území severní Itálie se ve zvýšené míře vyskytují rukopisné mapy. Většinou byly vyhotoveny podle tištěných předloh, nelze však vyloučit ani výskyt kartografických unikátů.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/048/685/2619269850/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Uhry',
        uuid: 'uhry',
        desc: 'Cenný soubor map zahrnuje nejen území jednotlivých uherských historických zemí, ale pokrývá svým záběrem téměř celý Balkánský poloostrov. Zvláštní důraz byl položen na shromáždění map z počátku 18. století, které zachycují průběh vítězných válek rakouských vojsk s Osmanskou říší. Kolekce obsahuje i řadu rukopisných plánů měst a především cenou mapografickou část, která jako jedna z prvních svého druhu zpracovává vývoj kartografického zobrazování území tehdejších Uher.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/051/925/2619316464/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Varia',
        uuid: 'varia',
        desc: 'Oddíl Varia byl vytvořen pravděpodobně až při kompletaci souboru ve Františkově muzeu nebo dokonce až v Moravské zemské knihovně. Obsahuje mapy, které se nepodařilo identifikovat v rukopisných Mollových katalozích. Vzhledem k velikosti souboru sem však byla mylně zařazena i díla, která své místo v původních Mollových celcích měla, ale byla při pořádání přehlédnuta. Vzhledem k desítky let ustálené lokaci v této signatuře, která byla navíc kodifikována tištěným katalogem Karla Kuchaře, nebyly mapy přemanipulovány k původním signaturám.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/053/336/2619316826/thumb_for_maps.jpg'
      });
    } else if (this.uuid === 'ceske-zeme') {
      this.pageTitle.setTitle(null, 'České země | Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'České země';
      this.subcollections.push({
        title: 'Čechy I',
        uuid: 'cechy1',
        desc: 'Geyerovy kresby staveb a profilů důlních děl, generální mapy českých zemí.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/036/786/2619267299/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Čechy II',
        uuid: 'cechy2',
        desc: 'Speciální mapy, plány a veduty Prahy i jiných českých měst, mapy krajů, rytiny z Merianovy topografie, plány zámku v Roudnici nad Labem.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/033/454/2619267498/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Morava',
        uuid: 'morava',
        desc: 'Geyerovy kresby staveb, důlních děl a antických památek, generální mapy Moravy, mapy krajů.',
        thumb: 'http://imageserver.mzk.cz/mzk03/000/904/114/2619267588/thumb_for_maps.jpg'
      });
      this.subcollections.push({
        title: 'Slezsko',
        uuid: 'slezsko',
        desc: 'Mapy celého území Slezska, Horního Slezska i jednotlivých knížectví, plány a veduty měst, klášterů, evangelických milostivých chrámů.',
        thumb: 'http://imageserver.mzk.cz/mzk03/001/026/471/2619267630/thumb_for_maps.jpg'
      });
    } else if (this.uuid === 'slezsko') {
      this.pageTitle.setTitle(null, 'Slezsko | České země | Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'Slezsko';
      this.fetchDocuments('geographic_names:*Slezsko*');
    } else if (this.uuid === 'morava') {
      this.pageTitle.setTitle(null, 'Morava | České země | Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'Morava';
      this.fetchDocuments('geographic_names:*Morava*');
    } else if (this.uuid === 'cechy1') {
      this.pageTitle.setTitle(null, 'Čechy I | České země | Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'Čechy I';
      this.fetchDocuments('geographic_names:*Česko*');
    } else if (this.uuid === 'cechy2') {
      this.pageTitle.setTitle(null, 'Čechy II | České země | Atlas Austriacus | Mollova mapová sbírka');
      this.title = 'Čechy II';
      this.fetchDocuments('geographic_names:*Česko*');
    }
  }



  fetchDocuments(key: string) {
    console.log('fetchDocuments', key);
    const q = 'q=(fedora.model:map OR fedora.model:graphic) AND collection:"vc:139b226e-f75c-46e0-a47a-ea788c00b567" AND '
    + key + '&fl='
    + 'PID,dostupnost,fedora.model,dc.creator,dc.title,datum_str,img_full_mime&rows=100&start=0';
    this.api.getSearchResults(q).subscribe(result => {
      this.documents = this.solr.documentItems(result);
    });
  }

  thumb(url: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}
