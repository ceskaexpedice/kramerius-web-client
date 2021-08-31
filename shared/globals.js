var APP_GLOBAL = {
    share_url: "localhost:4200/uuid/${UUID}",
    ga: 'UA-65303593-14',
    matomo_url: 'https://books2ebooks.eu/piwik/',
    enablePeriodicalVolumesYearsLayout: true, 
    enablePeriodicalIsssuesCalendarLayout: true,
    defaultPeriodicalVolumesLayout: "years",
    defaultPeriodicalIssuesLayout: "calendar",
    publicFilterDefault: false,
    dnnt: false,
    bigHomeLogo: false,
    hideHomeTitle: false,
    downloadApp: true,
    lang: ['cs', 'en', 'de', 'sk'],
    flags: {
      'cs': '/assets/img/flag_cs.png',
      'en': '/assets/img/flag_en.png',
      'de': '/assets/img/flag_de.png',
      'sk': '/assets/img/flag_sk.png'
    },
    aboutPage: {
      cs: '/assets/shared/about.cs.html',
      en: '/assets/shared/about.en.html'
    },
    faqPage: {
      cs: '/assets/shared/faq.cs.html',
      en: '/assets/shared/faq.en.html',
      de: '/assets/shared/faq.de.html',
      sk: '/assets/shared/faq.sk.html'
    },
    footer: {
      cs: '/assets/shared/footer.cs.html',
      en: '/assets/shared/footer.en.html',
      de: '/assets/shared/footer.de.html',
      sk: '/assets/shared/footer.sk.html'
    },
    showMetadata: 'always', // always | never | public
    showCitation: 'always', // always | never | public
    showSharing: 'always', // always | never | public
    showPdfGeneration: 'always', // always | never | public
    showPrintPreparation: 'always', // always | never | public
    showPageJpeg: 'always', // always | never | public
    showPageOcr: 'always', // always | never | public
    showTextSelection: 'always', // always | never | public
    showImageCrop: 'always', // always | never | public
    krameriusList: [
      {
        title: 'Moravská zemská knihovna',
        subtitle: 'Digitální knihovna Kramerius',
        code: 'mzk',
        logo: 'https://registr.digitalniknihovna.cz/libraries/mzk/logo',
        url: 'https://backend.ds-coil.uibk.ac.at',
        richCollections: true,
        joinedDoctypes: true,
        lemmatization: false,
        iiif: true,
        customRightMessage: true,
        doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic'],
        filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'geonames', 'collections', 'locations', 'languages']
      }
    ]
  }
