/* =========================================================
   EvacEye — Interaktionen
   Header-Status, mobiles Menü, Scroll-Reveal, Scan-Fortschrittsbalken,
   Kontaktformular mit automatischem Versand über Formspree.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Jahr im Footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scan-Fortschrittsbalken (oben am Viewport) ---------- */
  const scanProgress = document.getElementById('scanProgress');
  function updateScanProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (scanProgress) scanProgress.style.width = pct + '%';
  }

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
     GitHub Pages liefert nur statische Dateien aus, es gibt also
     keinen eigenen Server, der E-Mails verschicken könnte. Der
     Versand läuft deshalb über Formspree (https://formspree.io) —
     das Formular wird per fetch() im Hintergrund an Formspree
     gesendet, Formspree leitet die Nachricht dann automatisch als
     E-Mail an evaceye@hs-schmalkalden.de weiter. Der Besucher merkt
     davon nichts außer der Bestätigung auf der Seite.
  ---------------------------------------------------------------- */
  const kontaktForm = document.getElementById('kontaktForm');
  const formNote = document.getElementById('formNote');
  const formSubmitBtn = document.getElementById('formSubmitBtn');
  const formSubject = document.getElementById('formSubject');

  const ROLLEN_LABEL = {
    jury: 'Jury / COSIMA',
    sponsor: 'Sponsor / Förderer',
    hochschule: 'Hochschule / Forschung',
    feuerwehr: 'Feuerwehr / Einsatzkraft',
    kunde: 'Interessent / zukünftiger Kunde',
    sonstiges: 'Sonstiges'
  };

  if (kontaktForm) {
    // Sicherheitsnetz: Falls der Browser das Formular doch einmal nativ
    // abschickt (z. B. weil JavaScript kurzzeitig nicht reagiert hat)
    // und der Nutzer danach über "Zurück" auf die Seite kommt, zeigt
    // der Browser oft den zwischengespeicherten, noch ausgefüllten
    // Stand. Wir merken uns deshalb einen erfolgreichen Versand in
    // sessionStorage und leeren das Formular beim Laden der Seite,
    // falls dieser Zustand gesetzt ist.
    if (sessionStorage.getItem('evaceyeFormSent') === '1') {
      kontaktForm.reset();
      kontaktForm.rolle.selectedIndex = 0;
      sessionStorage.removeItem('evaceyeFormSent');
    }

    kontaktForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = kontaktForm.name.value.trim();
      const email = kontaktForm._replyto.value.trim();
      const rolleWert = kontaktForm.rolle.value;
      const rolleText = ROLLEN_LABEL[rolleWert] || rolleWert;
      const nachricht = kontaktForm.message.value.trim();

      if (!name || !email || !nachricht) {
        formNote.style.color = '#c0392b';
        formNote.textContent = 'Bitte fülle alle Pflichtfelder aus.';
        return;
      }

      // Betreff mit der gewählten Rolle versehen, damit im Postfach
      // sofort erkennbar ist, von wem die Anfrage kommt.
      if (formSubject) {
        formSubject.value = `Kontaktanfrage über die Website (${rolleText})`;
      }

      formSubmitBtn.disabled = true;
      formSubmitBtn.textContent = 'Wird gesendet …';
      formNote.style.color = 'rgba(11,19,32,0.65)';
      formNote.textContent = '';

      try {
        const response = await fetch(kontaktForm.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(kontaktForm)
        });

        if (response.ok) {
          formNote.style.color = '#1f7a3d';
          formNote.textContent = `Danke, ${name}! Deine Nachricht wurde gesendet, wir melden uns so schnell wie möglich.`;
          kontaktForm.reset();
          // Zusätzlich jedes Feld einzeln zurücksetzen, da reset() das
          // select-Feld in manchen Browsern nicht zuverlässig auf die
          // erste Option zurückspringen lässt, wenn der Wert per
          // JavaScript (formSubject) zuvor verändert wurde.
          kontaktForm.name.value = '';
          kontaktForm._replyto.value = '';
          kontaktForm.rolle.selectedIndex = 0;
          kontaktForm.message.value = '';
          sessionStorage.setItem('evaceyeFormSent', '1');
        } else {
          throw new Error('Formspree hat die Anfrage abgelehnt.');
        }
      } catch (error) {
        formNote.style.color = '#c0392b';
        formNote.textContent = 'Senden hat nicht funktioniert. Bitte versuche es erneut oder schreibe direkt an evaceye@hs-schmalkalden.de.';
      } finally {
        formSubmitBtn.disabled = false;
        formSubmitBtn.textContent = 'Nachricht senden';
      }
    });
  }

});
