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
 /*footer: {
  cs: '/assets/shared/nkp.footer.cs.html',
  en: '/assets/shared/nkp.footer.cs.html',
},*/
actions: {
  pdf: 'public',
  print: 'public',
  jpeg: 'public',
  text: 'public',
  citation: 'always',
  metadata: 'public',
  share: 'public',
  selection: 'public',
  crop: 'public'
},
/*auth: {
  logoutUrl: 'https://ndk.cz/Shibboleth.sso/Logout',
  loginUrl: 'https://ndk.cz/podminky-zpristupneni'
},*/
  krameriusList: [
    {
      title: 'Národní digitální knihovna ČR',
      subtitle: 'pro pedagogy a vědecké pracovníky institucí na úrovni vysokých škol a jejich studenty',
      code: 'nkp',
      logo: 'https://kramerius5.nkp.cz/logo.png',
      logoHome: 'https://kramerius5.nkp.cz/logo.png',
      url: 'https://kramerius5.nkp.cz',
      pdfUrl: 'https://kramerius5.nkp.cz/pdf/?uuid=',
      dnntUrl: 'https://ndk.cz',
      crisisUrl: false,
      richCollections: false,
      joinedDoctypes: true,
      lemmatization: false,
      iiif: false,
      customRightMessage: true,
      k3: 'http://kramerius.nkp.cz/kramerius/',
      doctypes: ['monograph', 'periodical', 'map', 'sheetmusic'],
      filters: ['accessibility', 'doctypes', 'licences', 'authors', 'keywords', 'collections', 'languages'],
      hiddenLocks: false,
      membranePrivateTitle: 'Neveřejné dílo - Covid',
      notice: '',
      licences: {
        dnnto: {
          label: {
            cs: 'DNNT online',
            en: 'DNNT online'
          },
          message: {
            cs: '/assets/shared/licences/dnnto.cs.html',
            en: '/assets/shared/licences/dnnto.en.html'
          },
          bar: true,
          actions: {
            pdf: false,
            print: false,
            jpeg: false,
            text: false,
            citation: true,
            metadata: true,
            share: true,
            selection: false,
            crop: false
          },
          watermark: {
            defaultText: 'DNNT',
            color: 'rgba(0, 0, 0, 0.3)',
            fontSize: 16,
            rowCount: 0,
            colCount: 0,
            probability: 0
          }
        },
        _private: {
          label: {
            cs: 'Dokument není­ veřejně dostupný',
            en: 'The document is not publicly accessible'
          },
          message: {
            cs: '/assets/shared/licences/_private.cs.html',
            en: '/assets/shared/licences/_private.en.html'
          },
        },
        dnntt: {
          label: {
            cs: 'DNNT terminál',
            en: 'DNNT terminal'
          },
          message: {
            cs: '/assets/shared/licences/dnntt.cs.html',
            en: '/assets/shared/licences/dnntt.en.html'
          },
          bar: false,
          watermark: {
            defaultText: 'DNNT',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: 16,
            rowCount: 0,
            colCount: 0,
            probability: 0
          }
        },
        covid_hide: {
          label: {
            cs: 'COVID',
            en: 'COVID'
          },
          message: {
            cs: '/assets/shared/licences/covid.cs.html',
            en: '/assets/shared/licences/covid.en.html'
          },
          bar: false,
          watermark: {
            defaultText: 'COVID',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: 16,
            rowCount: 0,
            colCount: 0,
            probability: 0
          }
        }
      }
    }
  ]

};
