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
let colorSchemeSettings = document.querySelector("#color-scheme-settings");
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
});

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
  siteToPortfolio.forEach((link) => {
    link.addEventListener("click", () => {
      tabContent.forEach((content) => {
        content.classList.remove("active");
      });
      tabs.forEach((tab) => {
        tab.classList.remove("active");
      });

      tabContent[2].classList.add("active");
      tabs[2].classList.add("active");
    });
  });

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
var swiper = new Swiper(".swiperTrusted", {
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
});

/*  ==================
    Shuffle JS
================== */
const Shuffle = window.Shuffle;
const element = document.querySelector("#wrapper-portfolio");
const tabPortfolio = document.querySelectorAll(".tab-portfolio");

const shuffleInstance = new Shuffle(element, {
  itemSelector: ".item-portfolio",
});

tabPortfolio.forEach((tab, index) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    tabPortfolio.forEach((tab) => {
      tab.classList.remove("text-primary");
    });
    var attr = tab.getAttribute("data-target");
    shuffleInstance.filter(attr);
    tabPortfolio[index].classList.add("text-primary");
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

// Open Modal portfolio
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

/*  =================
    Email JS
================== */
(function () {
  emailjs.init("YOUR_PUBLIC_KEY");
})();
document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const alertEmail = document.querySelector("#alert-email");
  const serviceID = "YOUR_SERVICE_ID";
  const templateID = "YOUR_TEMPLATE_ID";

  emailjs.sendForm(serviceID, templateID, this).then(
    function () {
      alertEmail.innerHTML = `
        <div class="rounded-md bg-[#C4F9E2] p-4">
          <p class="flex items-center text-sm font-medium text-[#004434]">
            <span class="pr-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#00B078"></circle>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.1203 6.78954C14.3865 7.05581 14.3865 7.48751 14.1203 7.75378L9.12026 12.7538C8.85399 13.02 8.42229 13.02 8.15602 12.7538L5.88329 10.4811C5.61703 10.2148 5.61703 9.78308 5.88329 9.51682C6.14956 9.25055 6.58126 9.25055 6.84753 9.51682L8.63814 11.3074L13.156 6.78954C13.4223 6.52328 13.854 6.52328 14.1203 6.78954Z"
                  fill="white"
                ></path>
              </svg>
            </span>
            Your message has been sent successfully!
          </p>
        </div>
      `;
    },
    function (error) {
      console.log("PLEASE YOU MUST SET [YOUR_PUBLIC_KEY] [YOUR_SERVICE_ID] [YOUR_TEMPLATE_ID] CHECK THE TUTORIAL IN DOCUMENTATION FILE, TO ACTIVATE THE CONTACT FORM!", error);
    }
  );
});
