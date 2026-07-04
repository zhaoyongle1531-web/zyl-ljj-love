const oneDay = 24 * 60 * 60 * 1000;

function $(selector) {
  return document.querySelector(selector);
}

function formatDate(dateText) {
  return dateText.replace(/-/g, ".");
}

function daysSince(dateText) {
  const start = new Date(`${dateText}T00:00:00`);
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / oneDay) + 1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadContent() {
  const response = await fetch("content.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`content.json returned ${response.status}`);
  }
  return response.json();
}

function setMilestones(content) {
  $("#togetherDays").textContent = `${daysSince(content.dates.together)}\u5929`;
  $("#engagedDays").textContent = `${daysSince(content.dates.engaged)}\u5929`;
  $("#togetherDate").textContent = formatDate(content.dates.together);
  $("#engagedDate").textContent = formatDate(content.dates.engaged);
}

function renderHero(content) {
  document.title = content.site.title;
  $("#heroEyebrow").textContent = content.site.eyebrow;
  $("#heroTitle").textContent = content.site.heroTitle;
  $("#heroText").textContent = content.site.heroText;
  $("#heroImage").src = content.site.heroImage;
}

function renderPeople(content) {
  const people = content.people;
  $("#birthdayText").textContent = people
    .map((person) => `${person.shortName || person.name}\uff1a${person.lunarBirthday.replace(/^\d{4}\u5e74/, "")}`)
    .join(" / ");

  $("#peopleGrid").innerHTML = people.map((person) => `
    <article>
      <span>${escapeHtml(person.role)}</span>
      <h2>${escapeHtml(person.name)}</h2>
      <p>\u519c\u5386\u751f\u65e5\uff1a${escapeHtml(person.lunarBirthday)}</p>
    </article>
  `).join("");
}

function renderMoments(content) {
  $("#momentGrid").innerHTML = content.moments.map((item, index) => `
    <article class="moment">
      <span class="moment__index">${String(index + 1).padStart(2, "0")}</span>
      <span class="moment__text">${escapeHtml(item)}</span>
    </article>
  `).join("");
}

function getPhotoName(photo) {
  return typeof photo === "string" ? photo : photo.file;
}

function renderGallery(content) {
  $("#galleryGrid").innerHTML = content.photos.map((photo, index) => {
    const name = getPhotoName(photo);
    const src = `assets/web_photos/${name}`;
    return `
      <button class="photo" type="button" data-src="${src}" aria-label="\u67e5\u770b\u7b2c ${index + 1} \u5f20\u56de\u5fc6\u7167\u7247">
        <img src="${src}" loading="lazy" alt="\u8d75\u6c38\u4e50\u548c\u5218\u6676\u6676\u7684\u56de\u5fc6\u7167\u7247 ${index + 1}">
      </button>
    `;
  }).join("");
}

function bindInteractions() {
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");

  $("#galleryGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".photo");
    if (!button) return;
    lightboxImg.src = button.dataset.src;
    lightbox.showModal();
  });

  $(".lightbox__close").addEventListener("click", () => {
    lightbox.close();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  $(".to-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderError(error) {
  $("#momentGrid").innerHTML = `
    <article class="moment">
      <span class="moment__index">!</span>
      <span class="moment__text">\u5185\u5bb9\u52a0\u8f7d\u5931\u8d25\uff1a${escapeHtml(error.message)}</span>
    </article>
  `;
}

async function init() {
  try {
    const content = await loadContent();
    renderHero(content);
    setMilestones(content);
    renderPeople(content);
    renderMoments(content);
    renderGallery(content);
  } catch (error) {
    renderError(error);
  }

  bindInteractions();
}

init();
