  const slides = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  let current = 0;
  const total = 3;
  const dots = [];

  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsEl.appendChild(d);
    dots.push(d);
  }

  function goTo(n) {
    current = (n + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function moveSlide(dir) { goTo(current + dir); }

  setInterval(() => moveSlide(1), 5000);
