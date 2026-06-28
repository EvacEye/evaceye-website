/* =========================================================
   EvacEye — Interaktionen
   Header-Status, mobiles Menü, Scroll-Reveal, Scan-Fortschrittsbalken,
   einfache Kontaktformular-Validierung (kein Backend angebunden).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Jahr im Footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: Hintergrund nach Scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    updateScanProgress();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scan-Fortschrittsbalken (oben am Viewport) ---------- */
  const scanProgress = document.getElementById('scanProgress');
  function updateScanProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (scanProgress) scanProgress.style.width = pct + '%';
  }

  /* ---------- Mobiles Menü ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    });

    // Menü schließen, sobald ein Link gewählt wird
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menü öffnen');
      });
    });
  }

  /* ---------- Aktiven Nav-Link je nach Section hervorheben ---------- */
  const sections = document.querySelectorAll('main > section[id], main[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- Scroll-Reveal für Karten und Sektionsinhalte ---------- */
  const revealTargets = document.querySelectorAll(
    '.problem-card, .feature-row, .pipeline-step, .spec-card, .team-card, .callout, .room-detail-card'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback ohne IntersectionObserver: alles sofort sichtbar
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Live-Demo im Hero: Räume reagieren auf Klick/Fokus ---------- */
  const demoRooms = document.querySelectorAll('.hero-floorplan .room');
  demoRooms.forEach((room) => {
    room.addEventListener('click', () => {
      room.style.transform = 'scale(0.97)';
      setTimeout(() => { room.style.transform = ''; }, 150);
    });
  });

  /* ----------------------------------------------------------------
     Kontaktformular
     Hinweis: Es ist aktuell kein Backend / Mail-Versand angebunden.
     Diese Funktion validiert nur clientseitig und zeigt eine
     Bestätigung an. Für echten Versand z. B. Formspree, Netlify
     Forms oder eine eigene API ergänzen (siehe Kommentar unten).
  ---------------------------------------------------------------- */
  const kontaktForm = document.getElementById('kontaktForm');
  const formNote = document.getElementById('formNote');

  if (kontaktForm) {
    kontaktForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = kontaktForm.name.value.trim();
      const email = kontaktForm.email.value.trim();
      const nachricht = kontaktForm.nachricht.value.trim();

      if (!name || !email || !nachricht) {
        formNote.style.color = '#c0392b';
        formNote.textContent = 'Bitte fülle alle Pflichtfelder aus.';
        return;
      }

      // ---- Hier echten Versand einbinden, z. B.: ----
      // fetch('https://formspree.io/f/DEINE_ID', {
      //   method: 'POST',
      //   headers: { 'Accept': 'application/json' },
      //   body: new FormData(kontaktForm)
      // });

      formNote.style.color = '#1f7a3d';
      formNote.textContent = `Danke, ${name}! Deine Nachricht wurde erfasst — da diese Seite aktuell ohne Versanddienst läuft, melden wir uns nach Einrichtung des Formulars zurück.`;
      kontaktForm.reset();
    });
  }

});
