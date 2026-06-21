(function () {
  const data = window.lovePageData || {};
  const slidesRoot = document.getElementById("slides");
  const app = document.getElementById("storyApp");
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const progressBar = document.getElementById("progressBar");
  const pageCount = document.getElementById("pageCount");

  let currentIndex = 0;
  let slides = [];

  const createElement = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const addPhoto = (slide, src, title, mode) => {
    if (!src) return;

    const frame = createElement("div", `slide-photo ${mode || ""}`.trim());
    const fallback = createElement("div", "hero-fallback", title || "Our Story");
    fallback.hidden = true;

    const img = document.createElement("img");
    img.dataset.src = src;
    img.alt = title || "我们的照片";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      img.remove();
      fallback.hidden = false;
    });

    frame.append(img, fallback);
    slide.appendChild(frame);
  };

  const addContent = (slide, label, title, text) => {
    const content = createElement("div", "slide-content");
    content.appendChild(createElement("p", "slide-label", label));
    content.appendChild(createElement("h1", "slide-title", title));

    if (text) {
      const body = createElement("p", "slide-text", text);
      content.appendChild(body);
    }

    slide.appendChild(content);
    return content;
  };

  const addCake = (content) => {
    const cake = createElement("div", "cake-scene");
    cake.setAttribute("aria-label", "生日蛋糕");
    cake.innerHTML = `
      <span class="cake-glow"></span>
      <span class="cake-candle candle-left"><i></i></span>
      <span class="cake-candle candle-right"><i></i></span>
      <span class="cake-top"></span>
      <span class="cake-cream"></span>
      <span class="cake-layer layer-one"></span>
      <span class="cake-layer layer-two"></span>
      <span class="cake-plate"></span>
    `;
    content.prepend(cake);
  };

  const makeSlide = ({ className = "", label, title, text, image, photoMode, button }) => {
    const slide = createElement("section", `slide ${className}`.trim());
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", title || label || "故事页");

    addPhoto(slide, image, title, photoMode);
    const content = addContent(slide, label || "", title || "", text || "");

    if (className.includes("final-page")) {
      addCake(content);
    }

    if (button) {
      const link = createElement("a", "wechat-button", button.text);
      link.href = button.href || "#";
      link.addEventListener("click", (event) => event.stopPropagation());
      content.appendChild(link);
    }

    return slide;
  };

  const loadSlideImage = (index, priority) => {
    const slide = slides[index];
    if (!slide) return;

    const img = slide.querySelector("img[data-src]");
    if (!img || img.src) return;

    img.loading = priority ? "eager" : "lazy";
    img.fetchPriority = priority ? "high" : "low";
    img.src = img.dataset.src;
  };

  const preloadNearbyImages = () => {
    loadSlideImage(currentIndex, true);
    loadSlideImage(currentIndex + 1, true);
    loadSlideImage(currentIndex + 2, false);
    loadSlideImage(currentIndex - 1, false);
  };

  const polishTextPages = (built) => {
    built.forEach((slide, index) => {
      const content = slide.querySelector(".slide-content");
      if (!content || !slide.classList.contains("text-page")) return;

      const number = createElement("span", "slide-number", String(index + 1).padStart(2, "0"));
      const mark = createElement("span", "slide-mark", "LOVE LETTER");
      const rule = createElement("span", "slide-rule");

      content.prepend(number, mark, rule);
    });
  };

  const buildSlides = () => {
    const hero = data.hero || {};
    const intro = data.intro || {};
    const photos = Array.isArray(data.photos) ? data.photos : [];
    const timeline = Array.isArray(data.timeline) ? data.timeline : [];
    const letter = Array.isArray(data.letter) ? data.letter : [];
    const promises = Array.isArray(data.promises) ? data.promises : [];
    const final = data.final || {};

    const built = [
      makeSlide({
        className: "cover-page",
        label: hero.kicker || "写给你",
        title: hero.title || "这些日子，我都记得",
        text: hero.subtitle || "",
        image: hero.image,
      }),
      makeSlide({
        className: "text-page light",
        label: "想先说的话",
        title: intro.title || "不是逼你回头，只是想认真表达一次",
        text: intro.text || "",
      }),
    ];

    photos.forEach((photo, index) => {
      built.push(
        makeSlide({
          className: "photo-page",
          title: photo.title || "某一天",
          text: photo.caption || "",
          image: photo.src,
          photoMode: "contain",
        })
      );
    });

    timeline.forEach((item) => {
      built.push(
        makeSlide({
          className: "text-page light",
          label: item.date || "时间线",
          title: item.title || "",
          text: item.text || "",
        })
      );
    });

    letter.forEach((text, index) => {
      built.push(
        makeSlide({
          className: "text-page light",
          label: index === 0 ? "我想认真对你说" : "我还想说",
          title: index === 0 ? "给你的这封信" : "还有这些心里话",
          text,
        })
      );
    });

    if (promises.length) {
      built.push(
        makeSlide({
          className: "text-page light",
          label: "以后",
          title: "如果还有机会，我想这样做",
          text: promises.map((item) => `• ${item}`).join("\n"),
        })
      );
    }

    built.push(
      makeSlide({
        className: "final-page",
        label: "最后",
        title: final.title || "我还是想牵着你的手往前走",
        text: final.text || "",
        button: {
          text: final.buttonText || "我想和你认真聊聊",
          href: final.contactLink || "#",
        },
      })
    );

    polishTextPages(built);
    slidesRoot.replaceChildren(...built);
    slides = Array.from(slidesRoot.children);
    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    });
  };

  const updateView = () => {
    slidesRoot.style.transform = `translate3d(0, -${currentIndex * 100}dvh, 0)`;

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
    });

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    pageCount.textContent = `${currentIndex + 1} / ${slides.length}`;
    progressBar.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    preloadNearbyImages();
  };

  const goTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    updateView();
  };

  const next = () => {
    if (currentIndex < slides.length - 1) goTo(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const bindEvents = () => {
    app.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      next();
    });

    nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      next();
    });

    prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      prev();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        prev();
      }
    });
  };

  buildSlides();
  bindEvents();
  updateView();
})();
