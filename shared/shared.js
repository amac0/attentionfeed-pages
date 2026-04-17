// ABOUTME: Web components for AttentionFeed shared header and footer.
// ABOUTME: Provides <af-header> and <af-footer> elements using Shadow DOM.

class AFHeader extends HTMLElement {
  static get observedAttributes() {
    return ['active-tab', 'base-url'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupToggle();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this.render();
      this.setupToggle();
    }
  }

  get baseUrl() {
    return (this.getAttribute('base-url') || 'https://attentionfeed.com')
      .replace(/\/$/, '');
  }

  get activeTab() {
    return this.getAttribute('active-tab') || 'projects';
  }

  render() {
    const base = this.baseUrl;
    const active = this.activeTab;

    const tabs = [
      { id: 'projects', label: 'Projects', href: `${base}/` },
      { id: 'blog', label: 'Blog', href: `${base}/blog` },
      { id: 'about', label: 'About', href: `${base}/about` },
    ];

    const activeLabel = tabs.find(t => t.id === active)?.label || 'Projects';

    const navLinks = tabs.map(tab => {
      const classes = 'nav-link' + (tab.id === active ? ' active' : '');
      const ariaCurrent = tab.id === active ? ' aria-current="page"' : '';
      return `<li><a href="${tab.href}" class="${classes}"${ariaCurrent}>${tab.label}</a></li>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .site-header {
          position: relative;
          border-bottom: 3px solid #501018;
          z-index: 100;
        }

        .site-header-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .site-header-bg::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300vmax;
          height: 300vmax;
          background-color: var(--color-benday-bg);
          background-image: var(--benday-pattern);
          background-repeat: repeat;
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .header-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-5) var(--space-5);
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .site-title {
          font-family: 'Baloo 2', cursive;
          font-weight: 700;
          font-size: var(--text-3xl);
          letter-spacing: 0.03em;
          color: white;
          text-decoration: none;
          line-height: 1;
        }

        .site-title:hover {
          text-decoration: none;
        }

        .nav-menu {
          list-style: none;
          display: flex;
          gap: 0;
          padding: 0;
          margin: 0;
        }

        .nav-link {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: white;
          text-decoration: none;
          opacity: 1;
          padding: var(--space-2) 0 var(--space-2) var(--space-4);
          display: inline-block;
        }

        .nav-link:hover {
          opacity: 1;
          text-decoration: none;
        }

        .nav-link.active {
          opacity: 1;
          position: relative;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          top: 0.35em;
          left: var(--space-4);
          right: 0.12em;
          height: 2px;
          background: white;
        }

        .nav-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 400;
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          gap: var(--space-1);
          align-items: center;
          padding: var(--space-2) 0;
        }

        @media (max-width: 768px) {
          .header-inner {
            padding: var(--space-4) var(--space-5);
            position: relative;
          }

          .site-title {
            font-size: var(--text-2xl);
          }

          .nav-toggle {
            display: flex;
          }

          .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: var(--space-5);
            flex-direction: column;
            overflow: hidden;
            padding: var(--space-2) 0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            background-color: var(--color-bg);
          }

          .nav-link {
            color: var(--color-primary);
          }

          .nav-link.active::before {
            display: none;
          }

          .nav-menu.open {
            display: flex;
          }

          .nav-menu li {
            padding: var(--space-1) var(--space-4);
          }
        }
      </style>

      <header class="site-header">
        <div class="site-header-bg"></div>
        <div class="header-inner">
          <a href="${base}/" class="site-title">attention feed</a>
          <nav class="site-nav" aria-label="Main navigation">
            <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
              <span class="nav-toggle-label">${activeLabel}</span>
              <span class="nav-toggle-arrow" aria-hidden="true">&#x25BE;</span>
            </button>
            <ul id="nav-menu" class="nav-menu">
              ${navLinks}
            </ul>
          </nav>
        </div>
      </header>
    `;
  }

  setupToggle() {
    const toggle = this.shadowRoot.querySelector('.nav-toggle');
    const menu = this.shadowRoot.querySelector('.nav-menu');

    toggle?.addEventListener('click', () => {
      const isOpen = menu?.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        menu?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  }
}


class AFFooter extends HTMLElement {
  static get observedAttributes() {
    return ['base-url'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  get baseUrl() {
    return (this.getAttribute('base-url') || 'https://attentionfeed.com')
      .replace(/\/$/, '');
  }

  render() {
    const base = this.baseUrl;
    const year = new Date().getFullYear();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .site-footer {
          position: relative;
          overflow: hidden;
          border-top: 3px solid #501018;
          font-family: 'IBM Plex Mono', monospace;
          font-size: var(--text-xs);
          color: white;
        }

        .site-footer::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300vmax;
          height: 300vmax;
          background-color: var(--color-benday-bg);
          background-image: var(--benday-pattern);
          background-repeat: repeat;
          transform: translate(-50%, -50%) rotate(45deg);
          z-index: 0;
        }

        .footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-5) var(--space-5);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-name {
          font-family: 'Baloo 2', cursive;
          font-weight: 700;
          font-size: var(--text-base);
          color: white;
        }

        .footer-links {
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .separator {
          margin: 0 var(--space-2);
          opacity: 0.4;
        }

        a {
          color: white;
        }

        a:hover {
          color: white;
          text-decoration: none;
        }
      </style>

      <footer class="site-footer">
        <div class="footer-inner">
          <span class="footer-name">attention feed</span>
          <span class="footer-links">
            <a href="${base}/colophon">Colophon</a>
            <span class="separator">/</span>
            <span>${year}</span>
          </span>
        </div>
      </footer>
    `;
  }
}

customElements.define('af-header', AFHeader);
customElements.define('af-footer', AFFooter);
