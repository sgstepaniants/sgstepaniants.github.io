const darkmodeToggle = document.querySelector(".darkmode-toggle");
const iconDarkMode = document.querySelector(".icon-darkmode");
const menuToggle = document.querySelector(".menu-toggle");
const menuList = document.querySelector(".menu-list");
const iconMenu = document.querySelector(".icon-menu");
const logo = document.querySelector(".logo img");

/*  ============================
    Localstorage Dark Mode
============================ */
if (localStorage.getItem("preferredTheme") == "dark-mode") {
  document.body.classList.toggle("dark-mode");
  logo.src = "assets/images/logo-darkmode.png";
}

/*  ==================
    Color Scheme
================== */
/*let colorSchemeSettings = document.querySelector("#color-scheme-settings");
let colorSchemeWrapper = document.querySelector("#color-scheme-wrapper");
let colorScheme = document.querySelectorAll(".color-scheme");

colorScheme.forEach((color) => {
  color.addEventListener("click", (e) => {
    document.body.classList.remove("theme-magenta", "theme-lime", "theme-default", "theme-violet", "theme-orange", "theme-aqua", "theme-coffee", "theme-teal", "theme-olive", "theme-crimson", "theme-chartreuse", "theme-indigo");
    document.body.classList.add(`theme-${e.target.getAttribute("data-color")}`);
  });
});

colorSchemeSettings.addEventListener("click", () => {
  colorSchemeWrapper.classList.toggle("mr-0");
});*/

/*  ==================
    To top start
================== */
window.onscroll = () => {
  const toTopStart = document.querySelector(".to-top-start");
  const nav = document.querySelector("nav");
  if (window.pageYOffset > nav.offsetTop) {
    toTopStart.classList.remove("hidden");
  } else {
    toTopStart.classList.add("hidden");
  }
};

/*  ==================
    Dark Mode
================== */
darkmodeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    iconDarkMode.src = "./assets/icons/sun.svg";
    logo.src = "assets/images/logo-darkmode.png";
    localStorage.setItem("preferredTheme", "dark-mode");
  } else {
    logo.src = "assets/images/logo.png";
    iconDarkMode.src = "./assets/icons/moon.svg";
    localStorage.removeItem("preferredTheme");
  }
});

/*  ==================
    Mobile Menu
================== */
menuToggle.addEventListener("click", () => {
  menuList.classList.toggle("hidden");
  if (menuList.classList.contains("hidden")) {
    iconMenu.src = "./assets/icons/menu.svg";
  } else {
    iconMenu.src = "./assets/icons/cross.svg";
  }
});

// Close menu when clicked outside
window.addEventListener("click", function (e) {
  if (!menuToggle.contains(e.target)) {
    iconMenu.src = "./assets/icons/menu.svg";
    menuList.classList.add("hidden");
  }
});

/*  ==================
    Tabs Menu
================== */
const tabs = document.querySelectorAll(".tab-toggle");
const tabContent = document.querySelectorAll(".tab-content");
const siteToPortfolio = document.querySelectorAll(".site-to-portfolio");
const btnToContact = document.querySelectorAll(".btn-to-contact");

tabs.forEach((tab, index) => {
  btnToContact.forEach((link) => {
    link.addEventListener("click", () => {
      tabContent.forEach((content) => {
        content.classList.remove("active");
      });
      tabs.forEach((tab) => {
        tab.classList.remove("active");
      });
      tabContent[4].classList.add("active");
      tabs[4].classList.add("active");
    });
  });

  tab.addEventListener("click", () => {
    tabContent.forEach((content) => {
      content.classList.remove("active");
    });
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    tabContent[index].classList.add("active");
    tabs[index].classList.add("active");
  });
});

/*  ==================
    Swiper JS
================== */
/*var swiper = new Swiper(".swiperTrusted", {
  slidesPerView: 5,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  breakpoints: {
    0: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    640: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 4,
      spaceBetween: 25,
    },
    1280: {
      slidesPerView: 5,
      spaceBetween: 25,
    },
  },
});

var swiper = new Swiper(".swiperClientSays", {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  navigation: {
    nextEl: ".client-button-next",
    prevEl: ".client-button-prev",
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
  },
});*/

/*  ==================
    Research layout and animated filters
================== */
const researchGrid = document.querySelector("#wrapper-portfolio");
const tabPortfolio = document.querySelectorAll(".tab-portfolio");
const researchCards = Array.from(researchGrid.querySelectorAll(".item-portfolio"));
const researchMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let researchShuffle;
let researchWidth = 0;

function researchAnimationOptions() {
  return {
    speed: researchMotion.matches ? 0 : 450,
    staggerAmount: researchMotion.matches ? 0 : 25,
    staggerAmountMax: researchMotion.matches ? 0 : 100,
  };
}

function updateResearchLayout() {
  // The Research tab starts hidden. Measure only after it has a real width.
  if (!researchGrid.offsetWidth) return;

  // Measure every paper, including filtered papers, so topic changes keep
  // the same card height and leave full titles and author lists visible.
  researchGrid.style.setProperty("--research-card-height", "auto");
  const height = Math.ceil(Math.max(...researchCards.map((card) => card.firstElementChild.offsetHeight)));
  researchGrid.style.setProperty("--research-card-height", `${height}px`);

  if (!researchShuffle) {
    researchShuffle = new window.Shuffle(researchGrid, {
      itemSelector: ".item-portfolio",
      gutterWidth: 20,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      ...researchAnimationOptions(),
    });
    // Let the lifted cards and their shadows extend beyond the grid edge.
    researchGrid.style.overflow = "visible";
  } else {
    researchShuffle.update();
  }
}

const researchResizeObserver = new ResizeObserver(([entry]) => {
  if (entry.contentRect.width !== researchWidth) {
    researchWidth = entry.contentRect.width;
    updateResearchLayout();
  }
});
researchResizeObserver.observe(researchGrid);
document.fonts.ready.then(updateResearchLayout);

researchMotion.addEventListener("change", () => {
  if (!researchShuffle) return;
  Object.assign(researchShuffle.options, researchAnimationOptions());
  researchShuffle.setItemTransitions(researchShuffle.items);
  researchGrid.style.transition = `height ${researchShuffle.options.speed}ms ${researchShuffle.options.easing}`;
  researchShuffle.update();
});

tabPortfolio.forEach((tab) => {
  tab.setAttribute("aria-pressed", String(tab.dataset.target === "all"));
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    tabPortfolio.forEach((filter) => {
      filter.classList.toggle("text-primary", filter === tab);
      filter.setAttribute("aria-pressed", String(filter === tab));
    });
    if (!researchShuffle) updateResearchLayout();
    researchShuffle.filter(tab.dataset.target);
  });
});

siteToPortfolio.forEach((link) => {
  link.addEventListener("click", () => {
    const targetFilter = Array.from(tabPortfolio).find((tab) => tab.dataset.target === link.dataset.researchGroup);
    if (!targetFilter) return;

    tabs[1].click();
    targetFilter.click();
    targetFilter.focus({ preventScroll: true });
    tabContent[1].scrollIntoView({
      behavior: researchMotion.matches ? "instant" : "smooth",
      block: "start",
    });
  });
});

/*  ============================
    Modal (portfolio & blog)
============================ */
const modalWrapper = document.querySelector(".modal");
const closeModal = document.querySelectorAll(".close-modal");
const contentModalPortfolio = document.querySelector("#content-modal-portfolio");
const openModalPortfolio = document.querySelectorAll(".open-modal-portfolio");
const contentModalBlog = document.querySelector("#content-modal-blog");
const openModalBlog = document.querySelectorAll(".open-modal-blog");

// Open modal portfolio
openModalPortfolio.forEach((open) => {
  open.onclick = function () {
    contentModalPortfolio.style.visibility = "visible";
    document.body.style.overflow = "hidden";
  };
});

// Open modal blog
openModalBlog.forEach((open) => {
  open.onclick = function () {
    contentModalPortfolio.style.visibility = "visible";
    document.body.style.overflow = "hidden";
  };
});

// Close modal (both)
closeModal.forEach((close) => {
  close.onclick = function () {
    contentModalPortfolio.style.visibility = "hidden";
    contentModalBlog.style.visibility = "hidden";
    document.body.style.overflow = "visible";
    modalWrapper.scrollTop = 0;
  };
});

// The modal will close when the user clicks anywhere outside the modal (both)
window.onclick = function (event) {
  if (event.target == contentModalPortfolio || event.target == contentModalBlog) {
    contentModalPortfolio.style.visibility = "hidden";
    contentModalBlog.style.visibility = "hidden";
    document.body.style.overflow = "visible";
    modalWrapper.scrollTop = 0;
  }
};
