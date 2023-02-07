let modalWrapper = document.querySelector(".modal");
let openModalPortfolio = document.querySelectorAll(".open-modal-portfolio");
let openModalBlog = document.querySelectorAll(".open-modal-blog");

/*  ================
    AJAX
================= */
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var data = JSON.parse(xhttp.responseText);
    let dataPortfolio = data["portfolio-data"];
    let dataBlog = data["blog-data"];

    // Portfolio data
    dataPortfolio.forEach((data, index) => {
      if (openModalPortfolio[index]) {
        openModalPortfolio[index].addEventListener("click", () => {
          modalWrapper.innerHTML = `
              <h1 class="text-xl font-medium text-heading">${data.title}</h1>
              <h2 class="text-sm font-normal text-paragraph">${data.authors}</h2>
              <a href="${data.link}" class="flex items-center text-sm text-primary hover:underline w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>${data.link}</span>
              </a>
              <img src="assets/images/portfolio-details/${data.image}" class="w-full mh-64 object-cover rounded-md my-7" alt="" />
              <ul class="flex flex-col gap-2.5 text-paragraph text-sm">
                <li><b class="font-medium text-heading">Venue :</b> ${data.venue}</li>
                <li><b class="font-medium text-heading">Date :</b> ${data.date}</li>
                <li><b class="font-medium text-heading">Keywords :</b> ${data.keywords}</li>
              </ul>
              <h2 class="text-base text-heading font-medium mt-7 mb-3">Abstract</h2>
              <p class="text-sm text-paragraph font-normal text-justify">${data.abstract}</p>
            `;
        });
      }
    });

    // Blog data
    dataBlog.forEach((data, index) => {
      if (openModalBlog[index]) {
        openModalBlog[index].addEventListener("click", () => {
          modalWrapper.innerHTML = `
          <span class="block text-sm text-paragraph mb-2">${data.time}</span>
          <h1 class="text-xl font-medium text-heading">${data.title}</h1>
          <a href="${data.link}" class="flex items-center text-sm text-primary hover:underline w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clip-rule="evenodd"
              />
            </svg>
            <span>${data.link}</span>
          </a>
          <h2 class="text-base text-heading font-medium mt-7 mb-3">Overview</h2>
          <p class="text-sm text-paragraph font-normal text-justify">${data.overview}</p>
              `;
        });
      }
    });
  }
};
xhttp.open("GET", "data.json", true);
xhttp.send();
