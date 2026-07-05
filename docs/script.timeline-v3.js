const oneDay = 24 * 60 * 60 * 1000;
const timelinePhotoIndexes = {
  20240930: [0, 1],
  20241002: [0],
  20241004: [0, 1],
  20241109: [0],
  20241130: [0],
  20241208: [0],
  20241231: [0],
  20250101: [0],
  20250102: [0],
  20250202: [0],
  20250208: [0, 1],
  20250214: [0, 1, 2],
  20250308: [0],
  20250316: [0],
  20250322: [0],
  20250329: [0],
  20250413: [0, 1],
  20250420: [0, 1],
  20250502: [0],
  20250509: [0],
  20250521: [0],
  20250523: [0, 1, 2],
  20250621: [0, 1, 2],
  20250623: [0],
  20250726: [0],
  20250830: [0],
  20251002: [0, 1, 2],
  20251005: [0],
  20251006: [0, 1, 2],
  20251007: [0, 1, 2],
  20251101: [0],
  20251108: [0, 1],
  20251115: [0],
  20251129: [0],
  20251212: [0],
  20251231: [0, 1],
  20260101: [0, 1, 2, 3],
  20260102: [0],
  20260117: [0],
  20260221: [0],
  20260318: [0],
  20260501: [0, 1, 2],
  20260516: [0],
  20260627: [0],
};

function $(selector) {
  return document.querySelector(selector);
}

function formatDate(dateText) {
  return dateText.replace(/-/g, ".");
}

function compactDate(dateText) {
  return dateText.replace(/-/g, "");
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

function renderTimeline(content) {
  const items = content.timeline.map((item, index) => {
    const dateKey = compactDate(item.date);
    const photoIndexes = timelinePhotoIndexes[dateKey] || [];
    const photoButtons = photoIndexes.map((photoIndex, photoPosition) => {
      const src = `assets/timeline_photos/${dateKey}_${photoIndex}.jpg`;
      const loading = index < 8 ? "eager" : "lazy";
      const fetchPriority = index < 4 ? "high" : "auto";
      return `
        <button class="timeline-photo timeline-photo--${photoPosition + 1}" type="button" data-lightbox-src="${src}" aria-label="查看 ${escapeHtml(item.title)} 的照片">
          <img src="${src}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}" alt="${escapeHtml(item.title)}">
        </button>
      `;
    }).join("");
    const photoCount = Math.min(Math.max(photoIndexes.length, 1), 4);
    const photos = photoButtons ? `<div class="timeline-photos timeline-photos--${photoCount}">${photoButtons}</div>` : "";

    const direction = index % 2 === 0 ? "top" : "bottom";

    return `
      <article class="timeline-item timeline-item--${direction}">
        <div class="timeline-item__body">
          ${photos}
        </div>
        <div class="timeline-item__marker">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <time datetime="${escapeHtml(item.date)}">${formatDate(item.date)}</time>
        </div>
        <h3 class="timeline-item__label">${escapeHtml(item.title)}</h3>
      </article>
    `;
  }).join("");

  $("#timelineList").innerHTML = `${items}
    <article class="timeline-item timeline-item--future timeline-item--bottom">
      <div class="timeline-item__marker timeline-item__marker--future">
        <span>∞</span>
        <strong>未完待续</strong>
      </div>
      <h3 class="timeline-item__label">后面的日子，也要一块慢慢写下去</h3>
    </article>
  `;
}

function getPhotoName(photo) {
  return typeof photo === "string" ? photo : photo.file;
}

function renderGallery(content) {
  $("#galleryGrid").innerHTML = content.photos.map((photo, index) => {
    const name = getPhotoName(photo);
    const src = `assets/web_photos/${name}`;
    return `
      <button class="photo" type="button" data-lightbox-src="${src}" aria-label="\u67e5\u770b\u7b2c ${index + 1} \u5f20\u56de\u5fc6\u7167\u7247">
        <img src="${src}" loading="lazy" alt="\u8d75\u6c38\u4e50\u548c\u5218\u6676\u6676\u7684\u56de\u5fc6\u7167\u7247 ${index + 1}">
      </button>
    `;
  }).join("");
}

function bindInteractions() {
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const timelineList = $("#timelineList");
  let isDraggingTimeline = false;
  let timelineMoved = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  function openLightbox(src) {
    if (!src) return;
    lightboxImg.src = src;
    lightbox.showModal();
  }

  timelineList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lightbox-src]");
    if (!button || !timelineList.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    timelineMoved = false;
    openLightbox(button.dataset.lightboxSrc);
  }, true);

  document.addEventListener("click", (event) => {
    if (timelineMoved) {
      event.preventDefault();
      timelineMoved = false;
      return;
    }
    const button = event.target.closest("[data-lightbox-src]");
    if (!button) return;
    openLightbox(button.dataset.lightboxSrc);
  });

  timelineList.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("[data-lightbox-src]")) return;
    isDraggingTimeline = true;
    timelineMoved = false;
    dragStartX = event.clientX;
    dragStartScroll = timelineList.scrollLeft;
    timelineList.classList.add("is-dragging");
    timelineList.setPointerCapture(event.pointerId);
  });

  timelineList.addEventListener("pointermove", (event) => {
    if (!isDraggingTimeline) return;
    const delta = event.clientX - dragStartX;
    if (Math.abs(delta) > 12) timelineMoved = true;
    timelineList.scrollLeft = dragStartScroll - delta;
  });

  function endTimelineDrag(event) {
    if (!isDraggingTimeline) return;
    isDraggingTimeline = false;
    timelineList.classList.remove("is-dragging");
    if (timelineList.hasPointerCapture(event.pointerId)) {
      timelineList.releasePointerCapture(event.pointerId);
    }
  }

  timelineList.addEventListener("pointerup", endTimelineDrag);
  timelineList.addEventListener("pointercancel", endTimelineDrag);

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
    renderTimeline(content);
    renderMoments(content);
    renderGallery(content);
  } catch (error) {
    renderError(error);
  }

  bindInteractions();
}

init();
