// -----------------------------
// Tabs + shared UI references
// -----------------------------
const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");

const urbexGrid = document.getElementById("urbex-grid");

// Gallery is split into two sections in index.html
const photosGrid = document.getElementById("photos-grid");
const artGrid = document.getElementById("art-grid");

// Shared lightbox elements
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxArtist = document.getElementById("lightbox-artist");
const lightboxDescription = document.getElementById("lightbox-description");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

// -----------------------------
// App state
// -----------------------------
let urbexEntries = [];
let photoEntries = [];
let artEntries = [];

let currentLightboxImages = [];
let currentLightboxTitle = "";
let currentLightboxDescription = "";
let currentLightboxArtist = "";
let currentLightboxArtistLink = "";
let currentImageIndex = 0;
let isLightboxTransitioning = false;

// -----------------------------
// Helpers
// -----------------------------
function setActiveTab(targetId) {
  const targetPanel = document.getElementById(targetId);
  if (!targetPanel) return;

  tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === targetId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function renderArtistMarkup(name, link) {
  if (!name) return "";

  if (link) {
    return `Art by <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`;
  }

  return `Art by ${escapeHtml(name)}`;
}

// -----------------------------
// Lightbox
// -----------------------------
function updateLightboxImage() {
  if (!currentLightboxImages.length || !lightboxImage) return;

  const imageSrc = currentLightboxImages[currentImageIndex];
  isLightboxTransitioning = true;

  lightboxImage.style.opacity = "0";
  lightboxImage.style.transform = "scale(0.98)";

  const nextImage = new Image();

  nextImage.onload = () => {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = currentLightboxTitle;
    lightboxTitle.textContent = currentLightboxTitle;
    lightboxDescription.textContent = currentLightboxDescription || "";

    if (lightboxArtist) {
      lightboxArtist.innerHTML = renderArtistMarkup(
        currentLightboxArtist,
        currentLightboxArtistLink
      );
    }

    lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentLightboxImages.length}`;

    requestAnimationFrame(() => {
      lightboxImage.style.opacity = "1";
      lightboxImage.style.transform = "scale(1)";
      isLightboxTransitioning = false;
    });
  };

  nextImage.onerror = () => {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = currentLightboxTitle;
    lightboxTitle.textContent = currentLightboxTitle;
    lightboxDescription.textContent = currentLightboxDescription || "";

    if (lightboxArtist) {
      lightboxArtist.innerHTML = renderArtistMarkup(
        currentLightboxArtist,
        currentLightboxArtistLink
      );
    }

    lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentLightboxImages.length}`;
    lightboxImage.style.opacity = "1";
    lightboxImage.style.transform = "scale(1)";
    isLightboxTransitioning = false;
  };

  nextImage.src = imageSrc;
}

function openLightbox(
  images,
  title,
  description = "",
  artist = "",
  artistLink = "",
  imageIndex = 0
) {
  if (!Array.isArray(images) || images.length === 0) return;

  currentLightboxImages = images;
  currentLightboxTitle = title;
  currentLightboxDescription = description;
  currentLightboxArtist = artist;
  currentLightboxArtistLink = artistLink;
  currentImageIndex = imageIndex;

  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";

  if (images.length <= 1) {
    lightboxPrev.style.display = "none";
    lightboxNext.style.display = "none";
  } else {
    lightboxPrev.style.display = "";
    lightboxNext.style.display = "";
  }

  updateLightboxImage();
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  isLightboxTransitioning = false;
}

function showNextImage(event) {
  event?.preventDefault();
  event?.stopPropagation();

  if (!currentLightboxImages.length || isLightboxTransitioning) return;

  currentImageIndex = (currentImageIndex + 1) % currentLightboxImages.length;
  updateLightboxImage();
}

function showPrevImage(event) {
  event?.preventDefault();
  event?.stopPropagation();

  if (!currentLightboxImages.length || isLightboxTransitioning) return;

  currentImageIndex =
    (currentImageIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
  updateLightboxImage();
}

// -----------------------------
// Urbex rendering
// -----------------------------
function renderEmptyUrbexState() {
  if (!urbexGrid) return;

  urbexGrid.innerHTML = `
    <div class="gallery-card empty-card">
      <div class="gallery-copy">
        <h3>No entries yet</h3>
        <p>No urbex entries have been added yet.</p>
      </div>
    </div>
  `;
}

function renderUrbexEntries() {
  if (!urbexGrid) return;

  urbexGrid.innerHTML = "";

  if (!urbexEntries.length) {
    renderEmptyUrbexState();
    return;
  }

  urbexEntries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "gallery-card";

    const images = Array.isArray(entry.images) ? entry.images : [];
    const coverImage = images[0] || "https://placehold.co/800x600/png?text=No+Image";

    card.innerHTML = `
      <div class="urbex-preview">
        <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(entry.title)}" />
        <div class="photo-count">${images.length} photo${images.length === 1 ? "" : "s"}</div>
      </div>
      <div class="gallery-copy">
        <h3>${escapeHtml(entry.title)}</h3>
        <p><strong>Date:</strong> ${escapeHtml(entry.date || "")}</p>
        <p>${escapeHtml(entry.notes || "")}</p>
      </div>
    `;

    const preview = card.querySelector(".urbex-preview");
    preview?.addEventListener("click", () => {
      openLightbox(
        images,
        entry.title,
        entry.description || entry.notes || "",
        "",
        "",
        0
      );
    });

    urbexGrid.appendChild(card);
  });
}

// -----------------------------
// Gallery rendering
// Notes:
// - pics.json powers the Photos section
// - art.json powers the Art section
// - no category field is needed anymore
// -----------------------------
function renderEmptyGalleryState(targetGrid, title = "Nothing here yet") {
  if (!targetGrid) return;

  targetGrid.innerHTML = `
    <div class="gallery-card empty-card">
      <div class="gallery-copy">
        <h3>${title}</h3>
        <p>Add some items to this section.</p>
      </div>
    </div>
  `;
}

function buildGalleryCard(entry) {
  const card = document.createElement("div");
  card.className = "gallery-card" + (entry.nsfw ? " nsfw" : "");

  const images = Array.isArray(entry.images) ? entry.images : [];
  const coverImage = images[0] || "https://placehold.co/800x600/png?text=No+Image";

  card.innerHTML = `
    <div class="gallery-expandable">
      <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(entry.title)}" />
    </div>
    <div class="gallery-copy">
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.description || "")}</p>
      ${
        entry.artist
          ? `<p class="gallery-credit">${renderArtistMarkup(entry.artist, entry.artistLink || "")}</p>`
          : ""
      }
    </div>
  `;

  const clickable = card.querySelector(".gallery-expandable");
  clickable?.addEventListener("click", () => {
    openLightbox(
      images,
      entry.title,
      entry.description || "",
      entry.artist || "",
      entry.artistLink || "",
      0
    );
  });

  return card;
}

function renderGalleryGroup(entries, targetGrid, emptyTitle) {
  if (!targetGrid) return;

  targetGrid.innerHTML = "";

  if (!entries.length) {
    renderEmptyGalleryState(targetGrid, emptyTitle);
    return;
  }

  entries.forEach((entry) => {
    targetGrid.appendChild(buildGalleryCard(entry));
  });
}

function renderGalleryEntries() {
  renderGalleryGroup(photoEntries, photosGrid, "No photo entries yet");
  renderGalleryGroup(artEntries, artGrid, "No art entries yet");
}

// -----------------------------
// Data loading
// -----------------------------
async function loadJsonFile(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while loading ${path}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`${path} must contain an array.`);
  }

  return data;
}

async function loadGalleryEntries() {
  if (!photosGrid || !artGrid) return;

  const results = await Promise.allSettled([
    loadJsonFile("data/pics.json"),
    loadJsonFile("data/art.json")
  ]);

  const picsResult = results[0];
  const artResult = results[1];

  if (picsResult.status === "fulfilled") {
    photoEntries = picsResult.value;
    console.log("Loaded pics.json:", photoEntries);
  } else {
    console.error("Could not load pics.json:", picsResult.reason);
    photoEntries = [];
  }

  if (artResult.status === "fulfilled") {
    artEntries = artResult.value;
    console.log("Loaded art.json:", artEntries);
  } else {
    console.error("Could not load art.json:", artResult.reason);
    artEntries = [];
  }

  renderGalleryEntries();
}

async function loadUrbexEntries() {
  if (!urbexGrid) return;

  try {
    const data = await loadJsonFile("data/urbex.json");
    console.log("Loaded urbex.json:", data);

    urbexEntries = data;
    renderUrbexEntries();
  } catch (error) {
    console.error("Could not load urbex entries:", error);
    urbexEntries = [];
    renderEmptyUrbexState();
  }
}

// -----------------------------
// Event binding
// -----------------------------
function bindTabs() {
  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab);
    });
  });
}

function bindLightboxControls() {
  lightboxClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLightbox();
  });

  lightboxNext?.addEventListener("click", showNextImage);
  lightboxPrev?.addEventListener("click", showPrevImage);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("active")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNextImage();
    if (event.key === "ArrowLeft") showPrevImage();
  });
}

// -----------------------------
// Age gate
// -----------------------------
const ageGate = document.getElementById("age-gate");
const ageYes = document.getElementById("age-yes");
const ageNo = document.getElementById("age-no");
const reverifyBtn = document.getElementById("reverify-age");

function showAgeGate() {
  ageGate?.style.setProperty("display", "flex");
}

function hideAgeGate() {
  ageGate?.style.setProperty("display", "none");
}

function unlockNSFW() {
  document.body.classList.remove("age-locked");
  localStorage.setItem("ageVerified", "true");
}

function lockNSFW() {
  document.body.classList.add("age-locked");
  localStorage.setItem("ageVerified", "false");
}

function initAgeGate() {
  const saved = localStorage.getItem("ageVerified");

  if (saved === "true") {
    unlockNSFW();
    hideAgeGate();
  } else if (saved === "false") {
    lockNSFW();
    hideAgeGate();
  } else {
    lockNSFW();
    showAgeGate();
  }

  ageYes?.addEventListener("click", () => {
    unlockNSFW();
    hideAgeGate();
  });

  ageNo?.addEventListener("click", () => {
    lockNSFW();
    hideAgeGate();
  });

  reverifyBtn?.addEventListener("click", () => {
    localStorage.removeItem("ageVerified");
    lockNSFW();
    showAgeGate();
  });
}

// -----------------------------
// Init
// -----------------------------
function init() {
  bindTabs();
  bindLightboxControls();
  initAgeGate();
  loadGalleryEntries();
  loadUrbexEntries();
}

init();