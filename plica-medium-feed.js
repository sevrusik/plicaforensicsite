/**
 * Load Medium articles for @sevrusik into #mediumArticles on the marketing site.
 */
(function () {
  var FEED_ENDPOINTS = [
    'https://api.plicaforensic.com/api/v1/medium-feed',
    '/api/v1/medium-feed',
    'articles.json',
  ];
  var PROFILE_URL = 'https://medium.com/@sevrusik';
  var MAX_ARTICLES = 12;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getLang() {
    if (typeof window.currentLang !== 'undefined' && window.currentLang) return window.currentLang;
    return document.documentElement.lang === 'ru' ? 'ru' : 'en';
  }

  function formatTag(pubDate, categories) {
    var lang = getLang();
    var locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    var month = '';
    if (pubDate) {
      var date = new Date(pubDate);
      if (!isNaN(date.getTime())) {
        month = date.toLocaleString(locale, { month: 'long', year: 'numeric' });
      }
    }
    var cats = (categories || []).slice(0, 2).map(function (c) {
      return String(c).replace(/-/g, ' ');
    });
    if (month && cats.length) return month + ' · ' + cats.join(' · ');
    if (month) return month;
    return cats.join(' · ');
  }

  function titleHtml(count) {
    var lang = getLang();
    if (lang === 'ru') {
      return 'Из практики.<br><em>' + count + ' статей на Medium.</em>';
    }
    return 'From the field.<br><em>' + count + ' articles on Medium.</em>';
  }

  function updateSectionTitle(count) {
    var titleEl = document.querySelector('#articles .s-title[data-i18n-html="art.title"]');
    if (!titleEl || !count) return;
    titleEl.innerHTML = titleHtml(count);
  }

  window.plicaRefreshArticleTitle = function () {
    var list = document.getElementById('mediumArticles');
    if (!list) return;
    var count = Number(list.getAttribute('data-count') || 0);
    if (count) updateSectionTitle(count);
  };

  function renderArticles(listEl, items, profileUrl) {
    if (!items.length) {
      listEl.innerHTML =
        '<p class="art-list-empty">' +
        '<a href="' + escapeHtml(profileUrl || PROFILE_URL) + '" target="_blank" rel="noopener">' +
        'Medium @sevrusik →</a></p>';
      return;
    }

    listEl.setAttribute('data-count', String(items.length));
    updateSectionTitle(items.length);

    listEl.innerHTML = items
      .map(function (item) {
        var tag = formatTag(item.pub_date, item.categories);
        var desc = item.description || '';
        return (
          '<a class="art-card" href="' +
          escapeHtml(item.link) +
          '" target="_blank" rel="noopener">' +
          '<div>' +
          '<div class="art-tag">' +
          escapeHtml(tag) +
          '</div>' +
          '<div class="art-title">' +
          escapeHtml(item.title) +
          '</div>' +
          (desc ? '<p class="art-desc">' + escapeHtml(desc) + '</p>' : '') +
          '</div>' +
          '<div class="art-arrow">→</div>' +
          '</a>'
        );
      })
      .join('');
  }

  function renderError(listEl, profileUrl) {
    listEl.innerHTML =
      '<p class="art-list-error">' +
      (getLang() === 'ru'
        ? 'Не удалось загрузить список. '
        : 'Could not load the feed. ') +
      '<a href="' +
      escapeHtml(profileUrl || PROFILE_URL) +
      '" target="_blank" rel="noopener">Medium @sevrusik →</a></p>';
  }

  function fetchFeed(endpoint) {
    return fetch(endpoint + '?limit=' + MAX_ARTICLES, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function tryEndpoints(index) {
    if (index >= FEED_ENDPOINTS.length) return Promise.reject(new Error('all endpoints failed'));
    return fetchFeed(FEED_ENDPOINTS[index]).catch(function () {
      return tryEndpoints(index + 1);
    });
  }

  function loadMediumArticles() {
    var listEl = document.getElementById('mediumArticles');
    if (!listEl) return;

    listEl.innerHTML = '<p class="art-list-loading" aria-live="polite">…</p>';

    tryEndpoints(0)
      .then(function (data) {
        renderArticles(listEl, data.items || [], data.profile_url || PROFILE_URL);
      })
      .catch(function () {
        renderError(listEl, PROFILE_URL);
      });
  }

  document.addEventListener('DOMContentLoaded', loadMediumArticles);
})();
