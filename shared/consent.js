// ABOUTME: Shared cookie consent for every AttentionFeed site that uses Google Analytics.
// ABOUTME: Stores one choice in a domain-wide cookie and only loads gtag after acceptance.

(function () {
  const COOKIE_NAME = 'af_consent';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year
  const BANNER_ID = 'af-consent-banner';
  const PRIVACY_URL = 'https://attentionfeed.com/privacy/';
  const ROOT_DOMAIN = 'attentionfeed.com';

  const currentScript = document.currentScript;
  const gaId = currentScript && currentScript.getAttribute('data-ga-id');
  if (!gaId) {
    return;
  }

  let analyticsLoaded = false;

  function cookieDomainAttribute() {
    const host = window.location.hostname;
    if (host === ROOT_DOMAIN || host.endsWith('.' + ROOT_DOMAIN)) {
      return '; Domain=' + ROOT_DOMAIN;
    }
    return '';
  }

  function secureAttribute() {
    return window.location.protocol === 'https:' ? '; Secure' : '';
  }

  function readStatus() {
    const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
    if (!match) return null;
    return match[1] === 'granted' || match[1] === 'denied' ? match[1] : null;
  }

  function writeStatus(value) {
    // A host-only cookie with the same name would shadow the shared one, so
    // expire it before writing the domain-wide value.
    document.cookie = COOKIE_NAME + '=; Max-Age=0; Path=/';
    document.cookie =
      COOKIE_NAME + '=' + value +
      '; Max-Age=' + COOKIE_MAX_AGE +
      '; Path=/; SameSite=Lax' +
      cookieDomainAttribute() +
      secureAttribute();
  }

  // Google Analytics sets _ga and _ga_<ID> cookies on the root domain; expire
  // them so declining actually stops the tracking that was running before.
  function clearAnalyticsCookies() {
    const names = document.cookie
      .split('; ')
      .map((pair) => pair.split('=')[0])
      .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');
    const expiry = '; Max-Age=0; Path=/';
    names.forEach((name) => {
      document.cookie = name + '=' + expiry;
      document.cookie = name + '=' + expiry + cookieDomainAttribute();
    });
  }

  // Google honours this flag on every later hit, so tracking stops on the
  // current page as soon as consent is withdrawn, not just on the next load.
  function setAnalyticsDisabled(disabled) {
    window['ga-disable-' + gaId] = disabled;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: disabled ? 'denied' : 'granted' });
    }
  }

  function loadAnalytics() {
    setAnalyticsDisabled(false);
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(script);
  }

  function removeBanner() {
    const existing = document.getElementById(BANNER_ID);
    if (existing) existing.remove();
  }

  function choose(value) {
    writeStatus(value);
    removeBanner();
    if (value === 'granted') {
      loadAnalytics();
    } else {
      setAnalyticsDisabled(true);
      clearAnalyticsCookies();
    }
  }

  function showBanner(takeFocus) {
    if (document.getElementById(BANNER_ID)) return;
    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.innerHTML =
      '<style>' +
      '#' + BANNER_ID + '{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
      'background:#2a2422;color:#faf8f5;font-family:Inter,system-ui,sans-serif;' +
      'font-size:0.9rem;line-height:1.4;padding:0.9rem 1.25rem;' +
      'box-shadow:0 -2px 8px rgba(0,0,0,0.25)}' +
      '#' + BANNER_ID + ' .af-consent-inner{max-width:1100px;margin:0 auto;display:flex;' +
      'flex-wrap:wrap;gap:0.75rem 1.5rem;align-items:center;justify-content:space-between}' +
      '#' + BANNER_ID + ' p{margin:0;flex:1 1 20rem}' +
      '#' + BANNER_ID + ' a{color:#faf8f5;text-decoration:underline}' +
      '#' + BANNER_ID + ' .af-consent-actions{display:flex;gap:0.5rem;flex:0 0 auto}' +
      '#' + BANNER_ID + ' button{font:inherit;font-weight:600;padding:0.5rem 1rem;' +
      'border-radius:8px;border:1px solid #faf8f5;cursor:pointer;background:transparent;color:#faf8f5}' +
      '#' + BANNER_ID + ' button[data-choice="granted"]{background:#6e1423;border-color:#6e1423}' +
      '</style>' +
      '<div class="af-consent-inner">' +
      '<p>We use Google Analytics to see which pages get visited. It sets cookies and ' +
      'sends your IP address to Google. Your choice applies to every attentionfeed.com site. ' +
      '<a href="' + PRIVACY_URL + '">Privacy Policy</a></p>' +
      '<div class="af-consent-actions">' +
      '<button type="button" data-choice="denied">Decline</button>' +
      '<button type="button" data-choice="granted">Accept analytics</button>' +
      '</div></div>';
    banner.querySelectorAll('button[data-choice]').forEach((button) => {
      button.addEventListener('click', () => choose(button.getAttribute('data-choice')));
    });
    (document.body || document.documentElement).appendChild(banner);
    // Only steal focus when the visitor asked for the banner; on first load the
    // labelled region is discoverable without interrupting the page.
    if (takeFocus) {
      banner.querySelector('button[data-choice="granted"]').focus();
    }
  }

  window.afConsent = {
    get status() {
      return readStatus();
    },
    grant() {
      choose('granted');
    },
    deny() {
      choose('denied');
    },
    open() {
      showBanner(true);
    },
  };

  const status = readStatus();
  if (status === 'granted') {
    loadAnalytics();
  } else if (status === null) {
    if (document.body) {
      showBanner(false);
    } else {
      document.addEventListener('DOMContentLoaded', function () { showBanner(false); });
    }
  }
})();
