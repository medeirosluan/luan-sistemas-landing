document.addEventListener('DOMContentLoaded', () => {

  /* ===== Utilitários ===== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ===== Ano dinâmico ===== */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ===== Tema (dark / light) ===== */
  const themeToggle = document.getElementById('themeToggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  };
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ===== Barra de progresso de scroll ===== */
  const scrollProgress = document.getElementById('scrollProgress');
  const onScroll = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / total) * 100;
    scrollProgress.style.width = progress + '%';

    // Header
    header.classList.toggle('scrolled', window.scrollY > 40);

    // Botão de voltar ao topo
    backToTop.classList.toggle('visible', window.scrollY > 600);

    // Scrollspy
    spy();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===== Voltar ao topo ===== */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ===== Header ===== */
  const header = document.getElementById('header');

  /* ===== Menu mobile ===== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  $$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

  /* ===== Scrollspy ===== */
  const sections = $$('section[id]');
  const navItems = $$('.nav-link');

  const spy = () => {
    const pos = window.scrollY + 90;
    let current = '';
    sections.forEach(section => {
      if (pos >= section.offsetTop - 50 && pos < section.offsetTop + section.offsetHeight) {
        current = section.id;
      }
    });
    if (!current && window.scrollY < 400) current = 'inicio';
    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  /* ===== Efeito tilt 3D ===== */
  const tiltEls = $$('[data-tilt]');

  tiltEls.forEach(el => {
    if (window.matchMedia('(hover: none)').matches || reduceMotion) return;

    const strength = 10;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * strength;
      const rotateX = (0.5 - y) * strength;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      el.style.boxShadow = `0 32px 64px rgba(79, 70, 229, ${0.10 + x * 0.12})`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      el.style.boxShadow = '';
    });
  });

  /* ===== Cursor glow ===== */
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const animateGlow = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  /* ===== Contadores animados ===== */
  const counters = $$('[data-counter]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.counter;
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();
      const suffix = el.dataset.suffix || '';

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      if (reduceMotion) {
        el.textContent = target + suffix;
      } else {
        requestAnimationFrame(step);
      }
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObserver.observe(el));

  /* ===== Reveal ao rolar ===== */
  const revealEls = $$('[data-reveal], .solution-card, .service-card, .step, .testimonial-card, .about-card');

  revealEls.forEach((el, i) => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
    el.style.transitionDelay = (i % 3) * 0.1 + 's';
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // Rede de segurança: um pulo de scroll muito rápido (âncora, roda do
  // mouse, scroll programático) pode passar por um elemento sem o
  // IntersectionObserver nunca registrar interseção nele, deixando-o
  // opacity:0 para sempre. Isso revela qualquer elemento que já ficou
  // acima da viewport (ou já está visível) e ainda não foi revelado.
  const revealFallback = () => {
    revealEls.forEach(el => {
      if (el.classList.contains('revealed')) return;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('revealed');
        revealObserver.unobserve(el);
      }
    });
  };
  window.addEventListener('scroll', revealFallback, { passive: true });
  revealFallback();

  /* ===== Scroll suave para o brand ===== */
  $$('.brand').forEach(brand => {
    brand.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ===== CTAs: leva o interesse escolhido para o formulário ===== */
  const serviceSelect = document.getElementById('servico');
  const messageField = document.getElementById('mensagem');
  $$('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      const interest = link.dataset.interest;
      serviceSelect.value = interest;
      if (!messageField.value.trim()) {
        messageField.value = `Olá! Tenho interesse em ${interest.toLowerCase()} e gostaria de saber mais.`;
      }
    });
  });

  /* ===== Formulário de contato ===== */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', e => {
    e.preventDefault();
    status.classList.remove('success', 'error');
    status.textContent = '';

    const get = (id) => document.getElementById(id).value.trim();
    const nome = get('nome');
    const email = get('email');
    const mensagem = get('mensagem');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errors = [];
    if (nome.length < 3) errors.push('informe seu nome completo.');
    if (!emailRegex.test(email)) errors.push('informe um e-mail válido.');
    if (mensagem.length < 10) errors.push('conte mais sobre o projeto (mín. 10 caracteres).');

    if (errors.length) {
      status.textContent = 'Por favor, ' + errors.join(' ');
      status.classList.add('error');
      return;
    }

    const telefone = get('telefone');
    const interesse = get('servico') || 'Informações sobre o sistema';
    const corpo = [
      'Olá! Vim pelo site da Luan Sistemas.',
      '',
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      telefone ? `Telefone: ${telefone}` : '',
      `Interesse: ${interesse}`,
      '',
      'Mensagem:',
      mensagem
    ].filter(Boolean).join('\n');

    status.textContent = 'Abrindo o WhatsApp para você revisar e enviar a mensagem.';
    status.classList.add('success');
    window.open(`https://wa.me/5511984881939?text=${encodeURIComponent(corpo)}`, '_blank', 'noopener,noreferrer');
  });

  /* ===== Inicialização ===== */
  onScroll();
  spy();

});
