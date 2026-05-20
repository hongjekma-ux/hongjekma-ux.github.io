const storageKey = "turkey-study-progress-v2";

function updateMicrocopy() {
  const targetLabels = Array.from(
    document.querySelectorAll(".day-card__target strong")
  );
  const sourceMetaLabels = Array.from(
    document.querySelectorAll(".day-card__meta")
  );

  targetLabels.forEach((label) => {
    if (label.textContent.includes("掌握到")) {
      label.textContent = "今天会慢慢看懂：";
    }
  });

  sourceMetaLabels.forEach((label) => {
    label.textContent = label.textContent.replaceAll("原始链接", "当天入口");
  });
}

function initProgress() {
  const progressBoxes = Array.from(
    document.querySelectorAll("[data-progress-id]")
  );

  const progressCount = document.querySelector("[data-complete-count]");
  const progressTotal = document.querySelector("[data-total-count]");
  const progressPercent = document.querySelector("[data-complete-percent]");
  const progressFill = document.querySelector("[data-progress-fill]");

  let progressState = {};

  try {
    progressState = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    progressState = {};
  }

  function renderProgress() {
    const total = progressBoxes.length;
    const complete = progressBoxes.filter((box) => box.checked).length;
    const percent = total === 0 ? 0 : Math.round((complete / total) * 100);
    const visualWidth = complete > 0 ? Math.max(percent, 4) : 0;

    if (progressCount) {
      progressCount.textContent = String(complete);
    }

    if (progressTotal) {
      progressTotal.textContent = String(total);
    }

    if (progressPercent) {
      progressPercent.textContent = `${percent}%`;
    }

    if (progressFill) {
      progressFill.style.width = `${visualWidth}%`;
      progressFill.style.minWidth = complete > 0 ? "0.95rem" : "0";
    }

    progressBoxes.forEach((box) => {
      const card = box.closest(".day-card");
      if (card) {
        card.classList.toggle("is-complete", box.checked);
      }
    });
  }

  progressBoxes.forEach((box) => {
    const id = box.dataset.progressId;
    box.checked = Boolean(progressState[id]);
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.matches("[data-progress-id]")) return;

    const id = target.dataset.progressId;
    progressState[id] = target.checked;
    localStorage.setItem(storageKey, JSON.stringify(progressState));
    window.requestAnimationFrame(renderProgress);
  });

  renderProgress();
}

function initSideNav() {
  const navLinks = Array.from(document.querySelectorAll("[data-nav-target]"));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("data-nav-target");
      const section = id ? document.getElementById(id) : null;
      return section ? { id, link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("data-nav-target") === id
      );
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "-15% 0px -60% 0px",
      threshold: [0.2, 0.45, 0.7],
    }
  );

  sections.forEach(({ section }) => observer.observe(section));

  const hash = window.location.hash.replace("#", "");
  if (hash) {
    setActive(hash);
  } else {
    setActive(sections[0].id);
  }
}

function init() {
  updateMicrocopy();
  initProgress();
  initSideNav();
}

init();
