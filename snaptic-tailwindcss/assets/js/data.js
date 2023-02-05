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
      openModalPortfolio[index].addEventListener("click", () => {
        modalWrapper.innerHTML = `
            <h1 class="text-xl font-medium text-heading">${data.title}</h1>
            <p class="text-sm text-paragraph font-normal mb-3 mt-1">${data.category}</p>
            <a href="${data.link}" class="flex items-center text-sm text-primary hover:underline w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Live Preview!</span>
            </a>
            <img src="assets/images/portfolio-details/${data.image}" class="w-full h-64 object-cover rounded-md my-7" alt="" />
            <ul class="flex flex-col gap-2.5 text-paragraph text-sm">
              <li><b class="font-medium text-heading">Client :</b> ${data.client}</li>
              <li><b class="font-medium text-heading">City :</b> ${data.city}</li>
              <li><b class="font-medium text-heading">Date :</b> ${data.date}</li>
            </ul>
            <h2 class="text-base text-heading font-medium mt-7 mb-3">Introduction</h2>
            <p class="text-sm text-paragraph font-normal text-justify">${data.introduction}</p>
            <h2 class="text-base text-heading font-medium mt-7 mb-3">Goals</h2>
            <p class="text-sm text-paragraph font-normal text-justify">${data.goals_desc[1]}</p>
            <ul class="list-disc text-sm ml-8 text-paragraph my-4">
              <li>${data.goals_list[1]}</li>
              <li>${data.goals_list[2]}</li>
              <li>${data.goals_list[3]}</li>
              <li>${data.goals_list[4]}</li>
              <li>${data.goals_list[5]}</li>
            </ul>
            <p class="text-sm text-paragraph font-normal text-justify">${data.goals_desc[2]}</p>
            <div class="flex rounded-md items-center gap-1 mt-8">
              <span class="text-heading text-sm font-medium mr-3">Share : </span>
              <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
              <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Facebook</span
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                </svg>
              </a>
              <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
              <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Instagram</span
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"
                  />
                </svg>
              </a>
              <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
              <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Twitter</span
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"
                  />
                </svg>
              </a>
              <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
              <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Youtube</span
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"
                  />
                </svg>
              </a>
            </div>
            `;
      });
    });

    // Blog data
    dataBlog.forEach((data, index) => {
      openModalBlog[index].addEventListener("click", () => {
        modalWrapper.innerHTML = `
        <span class="block text-sm text-paragraph mb-2">${data.time}</span>
        <h1 class="text-xl font-medium text-heading">${data.title}</h1>
        <img src="assets/images/blog-details/${data.image}" class="w-full h-64 object-cover rounded-md my-5" alt="" />
        <h2 class="text-base text-heading font-medium mt-7 mb-3">Introduction</h2>
        <p class="text-sm text-paragraph font-normal text-justify">${data.introduction["paragraph1"]}</p>

        <div class="border-l border-l-heading pl-4 my-5 ml-1">
          <h2 class="text-sm font-medium text-heading mb-2">“ ${data.quote} ”</h2>
          <span class="text-paragraph text-xs font-normal">— ${data.quote_by}</span>
        </div>

        <p class="text-sm text-paragraph font-normal text-justify">${data.introduction["paragraph2"]}</p>
        <div class="flex sm:flex-row flex-col justify-between mt-8 gap-3">
          <div class="flex rounded-md sm:items-center gap-1 sm:flex-row pr-8">
            <span class="text-heading text-sm font-medium mr-3 whitespace-nowrap">Tags : </span>
            <div>
              <a href="#" class="text-sm font-light text-paragraph hover:text-heading hover:underline">love</a>
              <span class="text-sm font-light text-paragraph">,</span>
              <a href="#" class="text-sm font-light text-paragraph hover:text-heading hover:underline">self</a>
              <span class="text-sm font-light text-paragraph">,</span>
              <a href="#" class="text-sm font-light text-paragraph hover:text-heading hover:underline">design</a>
            </div>
          </div>
          <div class="flex flex-wrap rounded-md items-center gap-1">
            <span class="text-heading text-sm font-medium mr-3 whitespace-nowrap">Share : </span>
            <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
            <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Facebook</span
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
              </svg>
            </a>
            <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
            <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Instagram</span
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"
                />
              </svg>
            </a>
            <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
            <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Twitter</span
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"
                />
              </svg>
            </a>
            <a href="#" class="has-tooltip w-[28px] h-[28px] grid place-items-center rounded-md group hover:bg-primary">
            <span
                class="tooltip font-medium rounded-md shadow-lg px-2 py-1 bg-heading text-theme -mt-[4.5rem] text-xs after:content[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-heading after:border-r-transparent after:border-b-transparent after:border-l-transparent"
                >Youtube</span
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-paragraph group-hover:fill-tertinary">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"
                />
              </svg>
            </a>
          </div>
        </div>
            `;
      });
    });
  }
};
xhttp.open("GET", "data.json", true);
xhttp.send();
