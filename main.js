import { POEMS } from './poems.js';

const list = document.getElementById('list');
const tpl = document.getElementById('poem-card');
const search = document.getElementById('search');
const stopAll = document.getElementById('stopAll');

function slugify(str){
  return str.toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildShareUrl(slug){
  const u = new URL(window.location.href);
  u.hash = slug;
  return u.toString();
}

function render(poems){
  list.innerHTML = '';
  poems.forEach(p => {
    const slug = slugify(p.title);
    const node = tpl.content.cloneNode(true);
    const article = node.querySelector('article');
    article.id = slug;

    const h = node.querySelector('.title');
    h.textContent = p.title;

    const by = node.querySelector('.byline');
    by.textContent = p.byline || '';

    const a = node.querySelector('.player');
    a.src = p.url;

    const open = node.querySelector('.direct');
    open.href = p.url;
    open.setAttribute('title', 'Open direct audio file');

    const playBtn = node.querySelector('.play');
    playBtn.addEventListener('click', () => {
      // Stop others
      document.querySelectorAll('audio').forEach(el => { if (el !== a) el.pause(); });
      a.paused ? a.play() : a.pause();
      playBtn.textContent = a.paused ? 'Play' : 'Pause';
    });
    a.addEventListener('play', () => playBtn.textContent = 'Pause');
    a.addEventListener('pause', () => playBtn.textContent = 'Play');

    const shareBtn = node.querySelector('.share');
    shareBtn.addEventListener('click', async () => {
      const link = buildShareUrl(slug);
      try{
        if (navigator.share){
          await navigator.share({ title: p.title, url: link });
        } else if (navigator.clipboard){
          await navigator.clipboard.writeText(link);
          shareBtn.textContent = 'Copied!';
          setTimeout(() => shareBtn.textContent = 'Copy link', 1500);
        } else {
          prompt('Copy this link:', link);
        }
      }catch(e){
        console.error(e);
      }
    });

    list.appendChild(node);
  });
}

function filter(term){
  const q = term.trim().toLowerCase();
  if (!q) return POEMS;
  return POEMS.filter(p => (p.title + ' ' + (p.byline || '')).toLowerCase().includes(q));
}

search?.addEventListener('input', () => render(filter(search.value)));

stopAll?.addEventListener('click', () => {
  document.querySelectorAll('audio').forEach(a => a.pause());
});

// Initial render
render(POEMS);

// Deep-linking: if URL has #slug, scroll and focus
if (location.hash){
  const id = location.hash.slice(1);
  const el = document.getElementById(id);
  if (el){
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 2000);
  }
}
