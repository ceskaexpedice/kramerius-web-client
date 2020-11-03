var APP_GLOBAL = {
  share_url: "https://kramerius5.nkp.cz/uuid/${UUID}",
  ga: 'UA-137497301-1',
  enablePeriodicalVolumesYearsLayout: true,
  enablePeriodicalIsssuesCalendarLayout: true,
  defaultPeriodicalVolumesLayout: "years", // grid | years
  defaultPeriodicalIssuesLayout: "calendar", // grid | calendar
  publicFilterDefault: 'notlogged',
  dnnt: true,
  advancedSearch: true,
  bigHomeLogo: true,
  aboutPage: {
    cs: '/assets/pages/nkp.about.cs.html',
    en: '/assets/pages/nkp.about.en.html',
  },
/*  faqPage: {
   cs: '/assets/pages/nkp.faq.cs.html',
   en: '/assets/pages/nkp.faq.en.html',
 },*/
 footer: {
    cs: '/assets/pages/nkp.footer.cs.html',
    en: '/assets/pages/nkp.footer.cs.html',
  },
  showMetadata: 'allways',
  showCitation: 'allways',
  showSharing: 'allways',
  showPdfGeneration: 'allways',
  showPrintPreparation: 'allways',
  showPageJpeg: 'allways',
  showPageOcr: 'allways',
  showTextSelection: 'allways',
  showImageCrop: 'allways',
  logoutUrl: 'https://kramerius-vs.nkp.cz/Shibboleth.sso/Logout?return=https://kramerius-vs.nkp.cz/podminky-zpristupneni',
  dnnt: {
    logoutUrl: 'https://ndk.cz/Shibboleth.sso/Logout?return=https://kramerius5.nkp.cz',
    loginUrl: 'https://ndk.cz/podminky-zpristupneni',
    watermarkColor: 'rgba(0, 0, 0, 0.6)',
    watermarkFontSize: 16,
    watermarkRowCount: 0,
    watermarkColCount: 0,
    watermarkProbability: 0
  },
  krameriusList: [
    {
      title: 'Národní digitální knihovna ČR',
      subtitle: 'pro pedagogy a vědecké pracovníky institucí na úrovni vysokých škol a jejich studenty',
      code: 'nkp',
      logo: 'https://kramerius5.nkp.cz/logo.png',
      logoHome: 'https://kramerius5.nkp.cz/logo.png',
      url: 'https://kramerius5.nkp.cz',
      pdfUrl: 'https://kramerius5.nkp.cz/?uuid=',
      dnntUrl: 'https://ndk.cz',
      crisisUrl: 'https://ndk.cz',
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      iiif: false,
      customRightMessage: true,
      k3: 'http://kramerius.nkp.cz/kramerius/',
      doctypes: ['monograph', 'periodical', 'map', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'authors', 'keywords', 'collections', 'languages'],
      dnntFilter: true,
      hiddenLocks: false,
      membranePrivateTitle: 'Neveřejné dílo - Covid',
      notice: ''
    }
  ]

};
