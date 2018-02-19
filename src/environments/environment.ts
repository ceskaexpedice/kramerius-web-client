// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // MZK
  title: 'Moravská zemská knihovna',
  logo: 'http://registr.digitalniknihovna.cz/libraries/mzk/logo',
  url: 'https://kramerius.mzk.cz',
  solr: {
    joinedDoctypes: true,
    facetTruncate: true,
    doctypes: ['monograph', 'periodical', 'map', 'graphic', 'archive', 'manuscript', 'soundrecording', 'sheetmusic']
  }

  // KNAV
  // title: 'Knihovna Akademie věd ČR',
  // logo: 'http://registr.digitalniknihovna.cz/libraries/knav/logo',
  // url: 'https://kramerius.lib.cas.cz',
  // solr: {
  //   joinedDoctypes: false,
  //   facetTruncate: true,
  //   doctypes: ['monograph', 'periodical']
  // }

  // NKP
  // title: 'Národní knihovna České republiky',
  // logo: 'http://registr.digitalniknihovna.cz/libraries/nkp/logo',
  // url: 'http://kramerius4.nkp.cz',
  // solr: {
  //   joinedDoctypes: false,
  //   facetTruncate: true,
  //   doctypes: ['monograph', 'periodical', 'map', 'sheetmusic']
  // }

  // MLP
  // title: 'Městská knihovna v Praze',
  // logo: 'http://registr.digitalniknihovna.cz/libraries/mlp/logo',
  // url: 'http://kramerius4.mlp.cz',
  // solr: {
  //   joinedDoctypes: true,
  //   facetTruncate: false,
  //   doctypes: ['monograph', 'periodical', 'soundrecording', 'sheetmusic']
  // }
};
