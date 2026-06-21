(function () {
  const data = window.lovePageData || {};

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node && value) node.textContent = value;
  };

  const imageExistsFallback = (img, fallback) => {
    img.addEventListener("error", () => {
      img.remove();
      if (fallback) fallback.hidden = false;
    });
  };

  const renderHero = () => {
    const hero = data.hero || {};
    setText("heroKicker", hero.kicker);
    setText("hero-title", hero.title);
    setText("heroSubtitle", hero.subtitle);

    const media = document.getElementById("heroMedia");
    const fallback = media.querySelector(".hero-fallback");
    if (!hero.image) return;

    const img = document.createElement("img");
    img.src = hero.image;
    img.alt = hero.title || "我们的照片";
    img.loading = "eager";
    imageExistsFallback(img, fallback);
    fallback.hidden = true;
    media.prepend(img);
  };

  const renderIntro = () => {
    const intro = data.intro || {};
    setText("intro-title", intro.title);
    setText("introText", intro.text);
  };

  const renderPhotos = () => {
    const strip = document.getElementById("photoStrip");
    const photos = Array.isArray(data.photos) ? data.photos : [];
    strip.innerHTML = "";

    if (!photos.length) {
      const empty = document.createElement("div");
      empty.className = "placeholder-card";
      empty.textContent = "这些照片，等你放进来。";
      strip.appendChild(empty);
      setupGalleryControls();
      return;
    }

    photos.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "photo-card";

      const placeholder = document.createElement("div");
      placeholder.className = "placeholder-card";
      placeholder.hidden = true;
      placeholder.textContent = photo.title || "我们的照片";

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.title || `我们的照片 ${index + 1}`;
      img.loading = index === 0 ? "eager" : "lazy";
      imageExistsFallback(img, placeholder);

      const caption = document.createElement("div");
      caption.className = "photo-caption";

      const title = document.createElement("strong");
      title.textContent = photo.title || "某一天";

      const text = document.createElement("span");
      text.textContent = photo.caption || "";

      caption.append(title, text);

      card.append(img, placeholder, caption);
      strip.appendChild(card);
    });

    setupGalleryControls();
  };

  const setupGalleryControls = () => {
    const strip = document.getElementById("photoStrip");
    const prev = document.getElementById("prevPhoto");
    const next = document.getElementById("nextPhoto");
    const count = document.getElementById("galleryCount");
    const cards = Array.from(strip.querySelectorAll(".photo-card"));
    let currentIndex = 0;
    let scrollFrame = null;

    if (!prev || !next || !count || !cards.length) {
      if (count) count.textContent = "0 / 0";
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
      return;
    }

    prev.disabled = false;
    next.disabled = false;

    const updateCount = () => {
      count.textContent = `${currentIndex + 1} / ${cards.length}`;
    };

    const scrollToCard = (index) => {
      currentIndex = (index + cards.length) % cards.length;
      cards[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      updateCount();
    };

    const syncFromScroll = () => {
      scrollFrame = null;
      const stripCenter = strip.scrollLeft + strip.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - stripCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateCount();
      }
    };

    prev.addEventListener("click", () => scrollToCard(currentIndex - 1));
    next.addEventListener("click", () => scrollToCard(currentIndex + 1));
    strip.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(syncFromScroll);
    });

    updateCount();
  };

  const renderTimeline = () => {
    const list = document.getElementById("timeline");
    const items = Array.isArray(data.timeline) ? data.timeline : [];
    list.innerHTML = "";

    items.forEach((item) => {
      const node = document.createElement("article");
      node.className = "timeline-item";
      const date = document.createElement("div");
      date.className = "timeline-date";
      date.textContent = item.date || "";

      const title = document.createElement("h3");
      title.className = "timeline-title";
      title.textContent = item.title || "";

      const text = document.createElement("p");
      text.className = "timeline-desc";
      text.textContent = item.text || "";

      node.append(date, title, text);
      list.appendChild(node);
    });
  };

  const renderLetter = () => {
    const letter = document.getElementById("letter");
    const paragraphs = Array.isArray(data.letter) ? data.letter : [];
    letter.innerHTML = "";

    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      letter.appendChild(p);
    });
  };

  const renderPromises = () => {
    const list = document.getElementById("promiseList");
    const promises = Array.isArray(data.promises) ? data.promises : [];
    list.innerHTML = "";

    promises.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
  };

  const renderFinal = () => {
    const final = data.final || {};
    setText("final-title", final.title);
    setText("finalText", final.text);

    const button = document.getElementById("contactButton");
    if (button) {
      button.textContent = final.buttonText || "我想和你认真聊聊";
      button.href = final.contactLink || "#";
    }
  };

  renderHero();
  renderIntro();
  renderPhotos();
  renderTimeline();
  renderLetter();
  renderPromises();
  renderFinal();
})();
