insert or ignore into quran_sources
  (id, name, url, version, license, checksum_sha256)
values
  (
    'tanzil-1.1',
    'Tanzil Quran Text',
    'https://tanzil.net/docs/download',
    '1.1',
    'CC BY 3.0 — verbatim copies only',
    null
  ),
  (
    'qac-0.4-mirror',
    'Quranic Arabic Corpus morphology mirror',
    'https://github.com/mustafa0x/quran-morphology',
    '8f38b39016824284f9ed16ae15069ff9102c4acf',
    'GNU GPL with attribution',
    '742bfac59941b2cb09736d5b7aae694af50792261fb8450cbf6afafcc340645f'
  );

insert or ignore into content_items
  (id, content_type, reference, payload, source_ids, status, author)
values
  (
    'fatiha-1-translation-fr',
    'translation',
    '1:1',
    '{"text":"Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux."}',
    '["tanzil-1.1","kalima-pedagogy-draft"]',
    'needs_review',
    'fixture locale'
  );
