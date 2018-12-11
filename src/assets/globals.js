var APP_GLOBAL = {
  // share_url: "http://localhost:4200/${KRAMERIUS}/uuid/${UUID}",
  share_url: "http://kramerius.rychtar.cloud/${KRAMERIUS}/uuid/${UUID}",
  ga: 'UA-65303593-14',
  enablePeriodicalVolumesYearsLayout: true, 
  enablePeriodicalIsssuesCalendarLayout: true,
  defaultPeriodicalVolumesLayout: "years", // grid | years
  defaultPeriodicalIssuesLayout: "calendar", // grid | calendar
  publicFilterDefault: false,
  krameriusList: [
    {
      title: 'Moravská zemská knihovna',
      code: 'mzk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/mzk/logo',
      url: 'https://kramerius.mzk.cz',
      richCollections: true,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    }
    ,
    {
      title: 'Národní knihovna České republiky',
      code: 'nkp',
      logo: 'https://registr.digitalniknihovna.cz/libraries/nkp/logo',
      url: 'http://kramerius4.nkp.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Knihovna Akademie věd ČR',
      code: 'knav',
      logo: 'https://registr.digitalniknihovna.cz/libraries/knav/logo',
      url: 'https://kramerius.lib.cas.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: true,
      doctypes: ['monograph', 'periodical'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'geonames', 'collections', 'locations', 'languages']
    },
    {
      title: 'Vědecká knihovna v Olomouci',
      code: 'vkol',
      logo: 'https://registr.digitalniknihovna.cz/libraries/vkol/logo',
      url: 'http://kramerius.kr-olomoucky.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'manuscript'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Studijní a vědecká knihovna v Hradci Králové',
      code: 'svkhk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/svkhk/logo',
      url: 'http://kramerius4.svkhk.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Severočeská vědecká knihovna v Ústí nad Labem',
      code: 'svkul',
      logo: 'https://registr.digitalniknihovna.cz/libraries/svkul/logo',
      url: 'https://kramerius.svkul.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Jihočeská vědecká knihovna v Českých Budějovicích',
      code: 'cbvk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/cbvk/logo',
      url: 'http://kramerius.cbvk.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Národní technická knihovna',
      code: 'ntk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/ntk/logo',
      url: 'https://kramerius.techlib.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Městská knihovna v Praze',
      code: 'mlp',
      logo: 'https://registr.digitalniknihovna.cz/libraries/mlp/logo',
      url: 'http://kramerius4.mlp.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: true,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'geonames', 'collections', 'locations', 'languages']
    },
    {
      title: 'Knihovna Antonína Švehly',
      code: 'uzei',
      logo: 'https://registr.digitalniknihovna.cz/libraries/uzei/logo',
      url: 'https://kramerius.uzei.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: true,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'geonames', 'collections', 'languages']
    },
    {
      title: 'Vysoká škola ekonomická v Praze',
      code: 'vse',
      logo: 'https://registr.digitalniknihovna.cz/libraries/vse/logo',
      url: 'https://kramerius.vse.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Univerzita Karlova v Praze - Fakulta sociálních věd',
      code: 'cuni_fsv',
      logo: 'https://registr.digitalniknihovna.cz/libraries/cuni_fsv/logo',
      url: 'http://kramerius.fsv.cuni.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Moravskoslezská vědecká knihovna v Ostravě',
      code: 'svkos',
      logo: 'https://registr.digitalniknihovna.cz/libraries/svkos/logo',
      url: 'https://camea2.svkos.cz/',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Mendelova univerzita v Brně',
      code: 'mendelu',
      logo: 'https://registr.digitalniknihovna.cz/libraries/mendelu/logo',
      url: 'http://kramerius4.mendelu.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Krajská knihovna Františka Bartoše ve Zlíně',
      code: 'kfbz',
      logo: 'https://registr.digitalniknihovna.cz/libraries/kfbz/logo',
      url: 'http://dlib.kfbz.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Digitální studovna Ministerstva obrany ČR',
      code: 'dsmo',
      logo: 'https://registr.digitalniknihovna.cz/libraries/dsmo/logo',
      url: 'https://kramerius.army.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Národní filmový archiv',
      code: 'nfa',
      logo: 'https://registr.digitalniknihovna.cz/libraries/nfa/logo',
      url: 'http://library.nfa.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Městská knihovna Česká Třebová',
      code: 'mkct',
      logo: 'https://registr.digitalniknihovna.cz/libraries/mkct/logo',
      url: 'https://k5.digiknihovna.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Krajská vědecká knihovna Liberec',
      code: 'kvkli',
      logo: 'https://registr.digitalniknihovna.cz/libraries/kvkli/logo',
      url: 'http://kramerius.kvkli.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Krajská knihovna Karlovy Vary',
      code: 'kkkv',
      logo: 'https://registr.digitalniknihovna.cz/libraries/kkkv/logo',
      url: 'http://k4.kr-karlovarsky.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Krajská knihovna Vysočiny',
      code: 'kkvhb',
      logo: 'https://registr.digitalniknihovna.cz/libraries/kkvhb/logo',
      url: 'http://kramerius.kkvysociny.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Národní lékařská knihovna v Praze',
      code: 'nlk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/nlk/logo',
      url: 'http://kramerius.medvik.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Středočeská vědecká knihovna v Kladně',
      code: 'svkkl',
      logo: 'https://registr.digitalniknihovna.cz/libraries/svkkl/logo',
      url: 'http://kramerius.svkkl.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Studijní a vědecká knihovna Plzeňského kraje',
      code: 'svkpk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/svkpk/logo',
      url: 'http://k4.svkpl.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Židovské muzeum v Praze',
      code: 'zmp',
      logo: 'https://registr.digitalniknihovna.cz/libraries/zmp/logo',
      url: 'http://kramerius4.jewishmuseum.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Národní muzeum',
      code: 'nm',
      logo: 'https://registr.digitalniknihovna.cz/libraries/nm/logo',
      url: 'http://kramerius.nm.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: true,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'geonames', 'collections', 'locations', 'languages']
    },
    {
      title: 'Knihovna Západočeského muzea v Plzni',
      code: 'zcm',
      logo: 'https://registr.digitalniknihovna.cz/libraries/zcm/logo',
      url: 'http://kramerius.zcm.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages']
    },
    {
      title: 'Národní archiv',
      code: 'nacr',
      logo: 'https://registr.digitalniknihovna.cz/libraries/nacr/logo',
      url: 'http://kramerius.nacr.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    },
    {
      title: 'Česká digitální knihovna',
      code: 'cdk',
      logo: 'https://registr.digitalniknihovna.cz/libraries/cdk/logo',
      url: 'https://cdk.lib.cas.cz',
      richCollections: false,
      joinedDoctypes: false,
      lemmatization: false,
      doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'locations', 'languages']
    }
  ]

};