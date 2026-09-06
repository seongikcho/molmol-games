/**
 * MOLMOL GAMES — i18n.js
 * KO default · EN toggle for hero, nav, buttons at minimum
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'molmol-lang';

  var dict = {
    ko: {
      nav_games: 'GAMES',
      nav_about: 'ABOUT',
      nav_news: 'NEWS',
      nav_recruit: 'RECRUIT',
      nav_contact: 'CONTACT',
      nav_store: 'STORE',
      hero_eyebrow: 'ORIGINAL IP · PS5 / PC',
      hero_title: 'COTTON REVENANT',
      hero_tagline: 'Thread what the city forgot.',
      hero_sub: '끊어진 도시를 다시 꿰매다.',
      hero_cta_trailer: 'Watch Trailer',
      hero_cta_explore: 'Explore Games',
      scroll_hint: 'Scroll',
      view_game: 'View Game',
      view_more: 'View more',
      recruit_teaser: '몰몰과 다음 세계를 만들 사람',
      recruit_cta: 'Join Us',
      back_to_top: 'Back to Top',
      footer_explore: 'Explore',
      footer_connect: 'Connect',
      footer_address: '서울시 성동구 성수일로 00 n층',
      lang_ko: 'KO',
      lang_en: 'EN',
      // Game showcases
      g1_tag: 'Rhythm-mixed Action Adventure',
      g1_tagline: 'Thread what the city forgot.',
      g1_desc: '죽은 실을 다시 엮어 도시를 꿰매는 재봉사. 리듬과 액션이 만나는 기억의 여정.',
      g2_tag: 'Character Collect · Life Action RPG',
      g2_tagline: 'Names return when the lanterns rise.',
      g2_desc: '밤시장에서 잃어버린 이름을 되찾는 몰리의 이야기. 캐릭터와 함께 살아가는 라이프 RPG.',
      g3_tag: 'Co-op Horror Adventure',
      g3_tagline: 'Speak with your hands. Survive together.',
      g3_desc: '말이 사라진 마을. 몸짓만으로 탈출하는 협동 호러 어드벤처.',
      g4_tag: 'East Asian Myth Fantasy · Flagship',
      g4_tagline: 'Wake the kingdom under water.',
      g4_desc: '물 아래 잠든 왕국을 깨우는 동아시아 신화 판타지. 몰몰의 차기 플래그십.',
      platforms: 'Platforms',
      status_released: 'Released',
      status_live: 'Live',
      status_dev: 'In Development',
      news_section: 'NEWS',
      page_games_title: 'GAMES',
      page_games_lede: '캐릭터가 먼저 말하고, 시스템은 그 감정을 뒷받침한다.',
      page_about_title: 'ABOUT',
      page_news_title: 'NEWS',
      page_recruit_title: 'RECRUIT',
      page_contact_title: 'CONTACT',
      page_store_title: 'STORE',
      apply: 'Apply',
      notify: 'Notify Me',
      coming_soon: 'Coming Soon',
      form_submit: 'Send Message',
      form_success_title: '메시지가 전달되었습니다',
      form_success_body: '확인 후 빠른 시일 내에 답변드리겠습니다.',
      trailer_title: 'Trailer',
      trailer_placeholder: 'Trailer placeholder',
      notify_title: '출시 알림',
      notify_body: '상품이 준비되면 이메일로 알려드립니다.',
      notify_submit: 'Subscribe',
      menu_open: '메뉴 열기',
      menu_close: '메뉴 닫기'
    },
    en: {
      nav_games: 'GAMES',
      nav_about: 'ABOUT',
      nav_news: 'NEWS',
      nav_recruit: 'RECRUIT',
      nav_contact: 'CONTACT',
      nav_store: 'STORE',
      hero_eyebrow: 'ORIGINAL IP · PS5 / PC',
      hero_title: 'COTTON REVENANT',
      hero_tagline: 'Thread what the city forgot.',
      hero_sub: 'Restitch a city cut loose from memory.',
      hero_cta_trailer: 'Watch Trailer',
      hero_cta_explore: 'Explore Games',
      scroll_hint: 'Scroll',
      view_game: 'View Game',
      view_more: 'View more',
      recruit_teaser: 'Build the next world with Molmol',
      recruit_cta: 'Join Us',
      back_to_top: 'Back to Top',
      footer_explore: 'Explore',
      footer_connect: 'Connect',
      footer_address: 'Seongsu-il-ro 00, nF, Seongdong-gu, Seoul',
      lang_ko: 'KO',
      lang_en: 'EN',
      g1_tag: 'Rhythm-mixed Action Adventure',
      g1_tagline: 'Thread what the city forgot.',
      g1_desc: 'A tailor reweaves a dead-thread city—stitching memories through rhythm and action.',
      g2_tag: 'Character Collect · Life Action RPG',
      g2_tagline: 'Names return when the lanterns rise.',
      g2_desc: 'Molly reclaiming lost names at the night market. A life RPG that lives with its cast.',
      g3_tag: 'Co-op Horror Adventure',
      g3_tagline: 'Speak with your hands. Survive together.',
      g3_desc: 'A silent town. Escape by gesture alone in this co-op horror adventure.',
      g4_tag: 'East Asian Myth Fantasy · Flagship',
      g4_tagline: 'Wake the kingdom under water.',
      g4_desc: 'An East Asian myth fantasy that wakes a kingdom asleep beneath the water. Our next flagship.',
      platforms: 'Platforms',
      status_released: 'Released',
      status_live: 'Live',
      status_dev: 'In Development',
      news_section: 'NEWS',
      page_games_title: 'GAMES',
      page_games_lede: 'Characters speak first. Systems carry the feeling.',
      page_about_title: 'ABOUT',
      page_news_title: 'NEWS',
      page_recruit_title: 'RECRUIT',
      page_contact_title: 'CONTACT',
      page_store_title: 'STORE',
      apply: 'Apply',
      notify: 'Notify Me',
      coming_soon: 'Coming Soon',
      form_submit: 'Send Message',
      form_success_title: 'Message sent',
      form_success_body: 'We\'ll get back to you soon.',
      trailer_title: 'Trailer',
      trailer_placeholder: 'Trailer placeholder',
      notify_title: 'Notify me',
      notify_body: 'We\'ll email you when this item is ready.',
      notify_submit: 'Subscribe',
      menu_open: 'Open menu',
      menu_close: 'Close menu'
    }
  };

  var current = 'ko';

  function getLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return 'ko';
  }

  function setLang(lang) {
    if (lang !== 'ko' && lang !== 'en') lang = 'ko';
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-ko', lang === 'ko');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[lang] && dict[lang][key] != null) {
        el.textContent = dict[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (dict[lang] && dict[lang][key] != null) {
        el.setAttribute('aria-label', dict[lang][key]);
      }
    });

    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function t(key) {
    return (dict[current] && dict[current][key]) || key;
  }

  function init() {
    current = getLang();
    setLang(current);

    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  global.MolmolI18n = { init: init, setLang: setLang, getLang: getLang, t: t, dict: dict };
})(typeof window !== 'undefined' ? window : this);
