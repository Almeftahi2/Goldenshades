(function(){
  const items = Array.from(document.querySelectorAll('[data-gallery-item]'));
  if(!items.length) return;

  const lb = document.querySelector('[data-lightbox]');
  const lbImg = document.querySelector('[data-lightbox-img]');
  const btnPrev = document.querySelector('[data-lb-prev]');
  const btnNext = document.querySelector('[data-lb-next]');
  const btnClose = document.querySelector('[data-lb-close]');

  let idx = 0;

  function openAt(i){
    idx = i;
    const src = items[idx].getAttribute('data-full');
    lbImg.src = src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function prev(){
    openAt((idx - 1 + items.length) % items.length);
  }
  function next(){
    openAt((idx + 1) % items.length);
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => openAt(i));
  });

  btnPrev && btnPrev.addEventListener('click', prev);
  btnNext && btnNext.addEventListener('click', next);
  btnClose && btnClose.addEventListener('click', close);
  lb && lb.addEventListener('click', (e) => { if(e.target === lb) close(); });

  document.addEventListener('keydown', (e) => {
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') next();
    if(e.key === 'ArrowRight') prev();
  });
})();