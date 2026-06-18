
window.API = window.API || "http://127.0.0.1:5000";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  .search-wrapper { position: relative; display: inline-block; }
  .search-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 320px;
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    z-index: 99999;
    max-height: 360px;
    overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7);
    display: none;
  }
  .search-dropdown.open { display: block; }
  .search-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.15s;
  }
  .search-item:hover { background: rgba(255,255,255,0.07); }
  .search-item:last-child { border-bottom: none; }
  .search-item-title { font-size: 0.88rem; font-weight: 600; color: #f0f0f0; }
  .search-item-title mark { background: none; color: #00c8ff; font-weight: 700; }
  .search-item-meta { font-size: 0.73rem; color: #888; margin-top: 3px; }
  .search-item-top { background: rgba(0,200,255,0.07); }
  .search-label {
    padding: 8px 16px 4px;
    font-size: 0.65rem;
    color: #555;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .search-empty { padding: 16px; text-align: center; color: #888; font-size: 0.85rem; }

  #searchResultsSection {
    padding: 24px 30px;
    display: none;
    background: #141414;
  }
  #searchResultsSection.open { display: block; }
  #searchResultsSection h2 { margin-bottom: 16px; font-size: 1.1rem; color: white; }
  .search-grid { display: flex; flex-wrap: wrap; gap: 14px; }
  .search-card {
    width: 190px;
    background: #222;
    border-radius: 10px;
    padding: 14px;
    border: 1px solid rgba(255,255,255,0.07);
    transition: transform 0.2s;
  }
  .search-card:hover { transform: translateY(-3px); background: #2a2a2a; }
  .search-card.best { border-color: #00c8ff; }
  .search-card-icon {
    width: 100%;
    height: 75px;
    border-radius: 6px;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #1a0028, #3d0060);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  .search-card-title { font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; line-height: 1.3; color: white; }
  .search-card-title mark { background: none; color: #00c8ff; font-weight: 700; }
  .search-card-meta { font-size: 0.72rem; color: #888; margin-bottom: 8px; }
  .search-card-btns { display: flex; gap: 6px; }
  .search-card-btns button {
    flex: 1; padding: 6px; border: none;
    border-radius: 5px; cursor: pointer;
    font-size: 0.72rem; font-weight: 600;
  }
  .btn-read { background: #00c8ff; color: black; }
  .btn-fav  { background: #333; color: white; }
`;
document.head.appendChild(style);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function hl(text, q) {
  if (!q || !text) return text || '';
  try {
    return text.replace(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<mark>$1</mark>'
    );
  } catch(e) { return text; }
}

async function openSearchPDF(id, url, title) {
  if (url && url !== 'null' && url !== 'undefined') {
    try { await fetch(`${window.API}/pdfs/${id}/view`, { method: 'POST' }); } catch(e) {}
   window.open(
`reader.html?pdf_id=${pdf.id}&file=${pdf.pdf_link}&page=1`,
"_blank"
);
  } else {
    alert(`"${title}" — not available yet`);
  }
}

async function addSearchFav(id, title) {
  try {
    await fetch(`${window.API}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: localStorage.getItem("userId"), pdf_id: id })
    });
    alert(`Added "${title}" to Favorites ❤️`);
  } catch(e) { alert('Failed to add'); }
}

// ─── SHOW FULL RESULTS ────────────────────────────────────────────────────────
function showResults(pdfs, q, section) {
  section.innerHTML = `
    <h2>🔍 Results for "<span style="color:#00c8ff">${q}</span>" — ${pdfs.length} found</h2>
    <div class="search-grid" id="searchGrid"></div>
  `;
  section.classList.add('open');

  const grid = document.getElementById('searchGrid');

  pdfs.forEach((pdf, i) => {
    const card = document.createElement('div');
    card.className = 'search-card' + (i === 0 ? ' best' : '');

    const icon = document.createElement('div');
    icon.className = 'search-card-icon';
    icon.textContent = '📄';

    const title = document.createElement('div');
    title.className = 'search-card-title';
    title.innerHTML = hl(pdf.title, q);

    const meta = document.createElement('div');
    meta.className = 'search-card-meta';
    meta.textContent = `${pdf.contributor || 'Unknown'} · 👁 ${pdf.views || 0}`;

    const btns = document.createElement('div');
    btns.className = 'search-card-btns';

    const readBtn = document.createElement('button');
    readBtn.className = 'btn-read';
    readBtn.textContent = 'Read';
    readBtn.addEventListener('click', function() {
      openSearchPDF(pdf.id, pdf.pdf_link, pdf.title);
    });

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-fav';
    favBtn.textContent = '♡ Fav';
    favBtn.addEventListener('click', function() {
      addSearchFav(pdf.id, pdf.title);
    });

    btns.appendChild(readBtn);
    btns.appendChild(favBtn);
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(btns);
    grid.appendChild(card);
  });

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── RUN SEARCH ───────────────────────────────────────────────────────────────
async function runSearch(q, dropdown, section) {
  try {
    const res = await fetch(`${window.API}/search?keyword=${encodeURIComponent(q)}`);
    const pdfs = await res.json();

    dropdown.innerHTML = '';

    if (!pdfs.length) {
      dropdown.innerHTML = `<div class="search-empty">No results for "<b>${q}</b>"</div>`;
      dropdown.classList.add('open');
      section.classList.remove('open');
      return;
    }

    const label = document.createElement('div');
    label.className = 'search-label';
    label.textContent = 'Best Match';
    dropdown.appendChild(label);

    pdfs.slice(0, 6).forEach((pdf, i) => {
      const item = document.createElement('div');
      item.className = 'search-item' + (i === 0 ? ' search-item-top' : '');

      const t = document.createElement('div');
      t.className = 'search-item-title';
      t.innerHTML = hl(pdf.title, q);

      const m = document.createElement('div');
      m.className = 'search-item-meta';
      m.textContent = `${pdf.contributor || 'Unknown'} · 👁 ${pdf.views || 0} views`;

      item.appendChild(t);
      item.appendChild(m);
      item.addEventListener('click', function() {
        document.getElementById('searchInput').value = pdf.title;
        dropdown.classList.remove('open');
        openSearchPDF(pdf.id, pdf.pdf_link, pdf.title);
      });
      dropdown.appendChild(item);
    });

    if (pdfs.length > 6) {
      const more = document.createElement('div');
      more.className = 'search-label';
      more.style.cssText = 'color:#00c8ff;cursor:pointer;padding:10px 16px;';
      more.textContent = `See all ${pdfs.length} results ↓`;
      more.addEventListener('click', function() {
        dropdown.classList.remove('open');
        showResults(pdfs, q, section);
      });
      dropdown.appendChild(more);
    }

    dropdown.classList.add('open');
    showResults(pdfs, q, section);

  } catch(err) {
    console.error('Search error:', err);
    dropdown.innerHTML = '<div class="search-empty" style="color:#e57373;">Search failed. Is server running?</div>';
    dropdown.classList.add('open');
  }
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) { console.warn('search.js: no #searchInput found'); return; }

  // Wrap
  const wrapper = document.createElement('div');
  wrapper.className = 'search-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  wrapper.appendChild(dropdown);

  // Results section
  let section = document.getElementById('searchResultsSection');
  if (!section) {
    section = document.createElement('div');
    section.id = 'searchResultsSection';
    const hero = document.querySelector('.hero');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const anchor = hero || main || header;
    if (anchor) {
      anchor.insertAdjacentElement('afterend', section);
    } else {
      document.body.insertBefore(section, document.body.firstChild);
    }
  }

  let timer;
  input.addEventListener('input', function() {
    clearTimeout(timer);
    const q = this.value.trim();
    if (q.length < 2) {
      dropdown.classList.remove('open');
      section.classList.remove('open');
      return;
    }
    timer = setTimeout(() => runSearch(q, dropdown, section), 350);
  });

  document.addEventListener('click', function(e) {
    if (!wrapper.contains(e.target)) dropdown.classList.remove('open');
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      section.classList.remove('open');
      this.value = '';
    }
  });

  console.log('search.js: initialized successfully ✅');
}

setupSearch();