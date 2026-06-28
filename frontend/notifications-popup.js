window.API = window.API || "http://127.0.0.1:5000";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const npStyle = document.createElement("style");
npStyle.textContent = `
  .np-popup {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%) translateY(-120px);
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 420px;
    width: 90%;
    z-index: 99999;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s;
    opacity: 0;
    cursor: pointer;
  }
  .np-popup.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  .np-popup-emoji { font-size: 2rem; flex-shrink: 0; }
  .np-popup-body { flex: 1; }
  .np-popup-title { font-size: 0.88rem; font-weight: 700; color: #f0f0f0; margin-bottom: 3px; }
  .np-popup-msg { font-size: 0.78rem; color: #aaa; line-height: 1.4; }
  .np-popup-close { background: none; border: none; color: #555; font-size: 1.1rem; cursor: pointer; padding: 0 4px; flex-shrink: 0; }
  .np-popup-close:hover { color: #aaa; }
  .np-popup-bar {
    position: absolute; bottom: 0; left: 0; height: 3px;
    background: linear-gradient(90deg, #00c8ff, #9b59b6);
    border-radius: 0 0 16px 16px; width: 100%;
    animation: npBar 5s linear forwards;
  }
  @keyframes npBar { from { width: 100%; } to { width: 0%; } }
  .np-bell-wrapper { position: relative; display: inline-flex; }
  .np-badge {
    position: absolute; top: -6px; right: -6px;
    background: #e50914; color: white; font-size: 0.6rem; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; border: 2px solid #0d0d0d;
    animation: npPulse 2s infinite; z-index: 10;
  }
  @keyframes npPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
`;
document.head.appendChild(npStyle);

// ─── CREATE POPUP ELEMENT ─────────────────────────────────────────────────────
const popup = document.createElement('div');
popup.className = 'np-popup';
document.body.appendChild(popup);

let popupTimer;
let popupQueue = [];
let isShowingPopup = false;
let currentPopupNotifId = null;
let currentPopupPdfId = null;

// ─── MARK NOTIFICATION AS SEEN ────────────────────────────────────────────────
async function markNotifSeen(id) {

  try {

    const seen =
    JSON.parse(
      localStorage.getItem("seenNotifIds") || "[]"
    );

    const idStr = String(id);

    if(!seen.includes(idStr)){

      seen.push(idStr);

      localStorage.setItem(
        "seenNotifIds",
        JSON.stringify(seen)
      );

    }

    await fetch(

      `${window.API}/notifications/read/${id}`,

      {
        method:"POST"
      }

    );

  }
  catch(e){

    console.log(e);

  }

}

// ─── SHOW POPUP ───────────────────────────────────────────────────────────────
function npShowPopup(emoji, title, msg, pdfId, notifId){
  
  if (localStorage.getItem('notifMuted') === 'true') return;
  if (isShowingPopup) {
   popupQueue.push({
    emoji,
    title,
    msg,
    pdfId,
    notifId
});
    return;
  }

  isShowingPopup = true;
  currentPopupPdfId = pdfId;
  currentPopupNotifId = notifId;

  popup.innerHTML = `
    <div class="np-popup-emoji">${emoji}</div>
    <div class="np-popup-body">
      <div class="np-popup-title">${title}</div>
      <div class="np-popup-msg">${msg}</div>
    </div>
    <button class="np-popup-close" id="npClose">✕</button>
    <div class="np-popup-bar"></div>
  `;

  document.getElementById('npClose').addEventListener('click', (e) => {
    e.stopPropagation();
    npHidePopup();
  });

  popup.addEventListener('click', npPopupClick);
  popup.classList.add('show');
  clearTimeout(popupTimer);
  popupTimer = setTimeout(() => npHidePopup(), 5000);
}

function npHidePopup() {
  popup.classList.remove('show');
  popup.removeEventListener('click', npPopupClick);
  clearTimeout(popupTimer);
  setTimeout(() => {
    isShowingPopup = false;
    if (popupQueue.length > 0) {
      const next = popupQueue.shift();
      npShowPopup(
    next.emoji,
    next.title,
    next.msg,
    next.pdfId,
    next.notifId
);
    }
  }, 600);
}

async function npPopupClick() {
 

  npHidePopup();
  if(currentPopupNotifId){

    await markNotifSeen(currentPopupNotifId);

}

  if (!currentPopupPdfId) {
    window.location.href = "home.html";
    return;
  }

  try {

    const res =
    await fetch(
      `${window.API}/pdfs/${currentPopupPdfId}`
    );

    const pdf =
    await res.json();

    if(pdf && pdf.pdf_link){

      window.location.href =
      `reader.html?pdf_id=${pdf.id}&file=${encodeURIComponent(pdf.pdf_link)}&page=1`;

    }

  }
  catch(err){

    console.log(err);

    window.location.href =
    "home.html";

  }

}

// ─── BELL BADGE ───────────────────────────────────────────────────────────────
function npUpdateBadge(count) {
  const bellBtns = document.querySelectorAll(
    'button[title="Notifications"], .nav-icon-btn, a[href="notifications.html"]'
  );
  bellBtns.forEach(btn => {
    if (!btn.parentElement.classList.contains('np-bell-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'np-bell-wrapper';
      btn.parentNode.insertBefore(wrapper, btn);
      wrapper.appendChild(btn);
    }
    const wrapper = btn.parentElement;
    const existing = wrapper.querySelector('.np-badge');
    if (existing) existing.remove();
    if (count > 0) {
      const badge = document.createElement('div');
      badge.className = 'np-badge';
      badge.textContent = count > 9 ? '9+' : count;
      wrapper.appendChild(badge);
    }
  });
}

// ─── MAIN INIT ────────────────────────────────────────────────────────────────
async function npInit() {
  if (localStorage.getItem('notifMuted') === 'true') return;

  try {
const userId = localStorage.getItem("userId");

await Promise.all([

    fetch(`${window.API}/notifications/generate-reading-list-reminders/${userId}`,{
        method:"POST"
    }),

    fetch(`${window.API}/notifications/generate-reading-reminders/${userId}`,{
        method:"POST"
    })

]);
const notifRes =
await fetch(`${window.API}/notifications/${userId}`);

const notifications =
await notifRes.json();

    // Get seen IDs
    const seenIds   = JSON.parse(localStorage.getItem('seenNotifIds') || '[]');

    // Filter unseen notifications
   const newNotifs = notifications;

    // Update bell badge
    npUpdateBadge(newNotifs.length);

    const lastShown = parseInt(localStorage.getItem('lastNotifShown') || '0');
    const now       = Date.now();
    const oneHour   = 60 * 60 * 1000;

    if (newNotifs.length > 0)
    {
      const otherNotifs  = newNotifs.filter(n => n.type !== 'new_pdf');

       if (otherNotifs.length > 0 && (now - lastShown >= oneHour || lastShown === 0)) {
        // Show other notifications once per hour
        setTimeout(() => {
          const notif = otherNotifs[0];
         const popupTitles = {
    welcome: ["🎉", "Welcome"],
    welcome_back: ["🌷", "Welcome Back"],
    reading_reminder: ["📖", "Continue Reading"],
    reading_list_reminder: ["📚", "Reading List Reminder"],
    completed_pdf: ["🎉", "Completed PDF"]
};

const [emoji, title] =
    popupTitles[notif.type] || ["🔔", "Notification"];

npShowPopup(
    emoji,
    title,
    notif.message,
    notif.pdf_id || null,
    notif.id
);
markNotifSeen(notif.id);

  
          localStorage.setItem('lastNotifShown', now.toString());
        }, 1500);
      }

    } 

  } catch(err) {
    console.warn('notifications-popup.js error:', err);
  }
}

// ─── CHECK EVERY HOUR ─────────────────────────────────────────────────────────
setInterval(npInit, 60 * 60 * 1000);

// ─── START ────────────────────────────────────────────────────────────────────
npInit();