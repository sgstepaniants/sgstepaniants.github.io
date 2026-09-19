import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const DATA_PATH = path.join(ROOT, "content", "academic-profile.yaml");
const INDEX_PATH = path.join(ROOT, "index.html");
const TEX_PATH = path.join(ROOT, "resume", "George_Stepaniants_CV.tex");
const CHECK = process.argv.includes("--check");
const SELF = "George Stepaniants";

function fail(message) {
  throw new Error(message);
}

function requireValue(value, label) {
  if (value === undefined || value === null || value === "") {
    fail("Missing required value: " + label);
  }
}

function asArray(value, label) {
  if (!Array.isArray(value)) fail(label + " must be a list");
  return value;
}

function validateUrl(value, label) {
  if (value && !/^https?:\/\//.test(value)) {
    fail(label + " must begin with http:// or https://");
  }
}

function researchImageSize(publication) {
  const image = fs.readFileSync(path.join(ROOT, "assets", "images", "portfolios", publication.image));
  if (image.length < 24 || !image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    fail("Cropped research images must be PNG files: " + publication.image);
  }
  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
}

function validate(data) {
  requireValue(data.meta?.schema_version, "meta.schema_version");
  requireValue(data.meta?.last_reviewed, "meta.last_reviewed");
  requireValue(data.profile?.name, "profile.name");
  asArray(data.profile?.emails, "profile.emails");
  requireValue(data.profile.emails[0], "profile.emails[0]");
  for (const [index, location] of asArray(data.profile?.locations, "profile.locations").entries()) {
    const label = "profile.locations[" + index + "]";
    requireValue(location.label, label + ".label");
    requireValue(location.url, label + ".url");
    validateUrl(location.url, label + ".url");
  }
  asArray(data.profile?.research_areas, "profile.research_areas");
  requireValue(data.profile?.recruitment_announcement?.lead, "profile.recruitment_announcement.lead");
  requireValue(data.profile?.recruitment_announcement?.text, "profile.recruitment_announcement.text");
  for (const [index, link] of asArray(data.profile.recruitment_announcement.links, "profile.recruitment_announcement.links").entries()) {
    const label = "profile.recruitment_announcement.links[" + index + "]";
    requireValue(link.label, label + ".label");
    requireValue(link.url, label + ".url");
    validateUrl(link.url, label + ".url");
  }

  const collections = [
    "employment",
    "education",
    "awards",
    "publications",
    "talks",
    "teaching",
    "mentoring",
    "service",
    "memberships",
    "internships",
    "news",
  ];
  const knownIds = new Set();
  for (const collection of collections) {
    for (const [index, item] of asArray(data[collection], collection).entries()) {
      requireValue(item.id, collection + "[" + index + "].id");
      if (knownIds.has(item.id)) fail("Duplicate record id: " + item.id);
      knownIds.add(item.id);
    }
  }

  for (const [index, publication] of data.publications.entries()) {
    requireValue(publication.title, "publications[" + index + "].title");
    asArray(publication.authors, "publications[" + index + "].authors");
    requireValue(publication.year, "publications[" + index + "].year");
    validateUrl(publication.url, "publications[" + index + "].url");
    if (publication.research_card) {
      for (const field of ["image", "card_venue", "published_date", "abstract"]) {
        requireValue(publication[field], "publications[" + index + "]." + field);
      }
      asArray(publication.groups, "publications[" + index + "].groups");
      asArray(publication.keywords, "publications[" + index + "].keywords");
      for (const group of publication.groups) {
        if (!["de", "ot", "ip", "other"].includes(group)) {
          fail("Unknown research group '" + group + "' on " + publication.id);
        }
      }
      for (const folder of ["portfolios", "portfolio-details"]) {
        const imagePath = path.join(ROOT, "assets", "images", folder, publication.image);
        if (!fs.existsSync(imagePath)) fail("Missing research image: " + imagePath);
      }
      if (publication.thumbnail) {
        const { crop, padding = 8 } = publication.thumbnail;
        if (!Array.isArray(crop) || crop.length !== 4 || !crop.every(Number.isFinite)) {
          fail(publication.id + ".thumbnail.crop must contain four pixel coordinates: x, y, width, height");
        }
        const [x, y, width, height] = crop;
        const source = researchImageSize(publication);
        if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > source.width || y + height > source.height) {
          fail("Thumbnail crop falls outside the image: " + publication.id);
        }
        if (!Number.isFinite(padding) || padding < 0 || padding > 32) {
          fail(publication.id + ".thumbnail.padding must be between 0 and 32 pixels");
        }
      }
    }
  }

  for (const [index, course] of data.teaching.entries()) {
    for (const field of ["code", "institution", "role", "term", "title", "overview", "responsibility"]) {
      requireValue(course[field], "teaching[" + index + "]." + field);
    }
    validateUrl(course.url, "teaching[" + index + "].url");
  }

  for (const item of [...data.meta.update_sources, ...data.awards, ...data.talks, ...data.mentoring, ...data.service]) {
    validateUrl(item.url, (item.id || item.name) + ".url");
  }

  for (const item of data.news) {
    for (const related of item.related || []) {
      if (!knownIds.has(related)) fail("News item " + item.id + " references unknown id " + related);
    }
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function markdownLinks(value) {
  const text = String(value ?? "");
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let cursor = 0;
  let output = "";
  let match;
  while ((match = pattern.exec(text)) !== null) {
    output += escapeHtml(text.slice(cursor, match.index));
    output += '<a class="hover:underline text-primary" href="' +
      escapeAttr(match[2]) + '">' + escapeHtml(match[1]) + "</a>";
    cursor = pattern.lastIndex;
  }
  output += escapeHtml(text.slice(cursor));
  return output;
}

function latex(value) {
  const replacements = {
    "\\": "\\textbackslash{}",
    "&": "\\&",
    "%": "\\%",
    "$": "\\$",
    "#": "\\#",
    "_": "\\_",
    "{": "\\{",
    "}": "\\}",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  return String(value ?? "").replace(/[\\&%$#_{}~^]/g, (character) => replacements[character]);
}

function latexDate(value) {
  let result = latex(value).replaceAll(" - ", " -- ");
  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December",
    "Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "Spring", "Summer", "Fall", "Current", "Present",
  ];
  for (const month of months) {
    result = result.replace(new RegExp("\\b" + month + "\\b", "g"), "\\textsc{" + month + "}");
  }
  return result;
}

function texUrl(url) {
  return "\\detokenize{" + String(url).replaceAll("}", "") + "}";
}

function texLink(url, label) {
  return url ? "\\href{" + texUrl(url) + "}{" + latex(label) + "}" : latex(label);
}

function texPaperclip(url) {
  return url ? "\\href{" + texUrl(url) + "}{\\faPaperclip}" : "";
}

function oxford(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + " and " + items[1];
  return items.slice(0, -1).join(", ") + ", and " + items.at(-1);
}

function webAuthors(publication, emphasizeSelf = false) {
  return oxford(publication.authors.map((author) => {
    const escaped = escapeHtml(author);
    return emphasizeSelf && author === SELF ? "<strong>" + escaped + "</strong>" : escaped;
  }));
}

function texAuthors(publication) {
  const equal = new Set(publication.equal_contribution || []);
  return oxford(publication.authors.map((author) => {
    let result = latex(author);
    if (publication.alphabetical_order && author === SELF) result = "$\\dagger$ " + result;
    if (equal.has(author)) result += "$^*$";
    return result;
  }));
}

function webCitation(publication) {
  let output = webAuthors(publication) + ". &ldquo;" + escapeHtml(publication.title) + ".&rdquo;";
  if (publication.venue) output += " <em>" + escapeHtml(publication.venue) + "</em>";
  if (publication.citation_detail) output += " " + escapeHtml(publication.citation_detail);
  if (publication.status) output += " <strong>(" + escapeHtml(publication.status) + ")</strong>";
  return output;
}

function texCitation(publication) {
  let output = texAuthors(publication) + ". ``" + latex(publication.title) + ".''";
  if (publication.venue) output += " \\textit{" + latex(publication.venue) + "}";
  if (publication.citation_detail) output += " " + latex(publication.citation_detail);
  if (publication.alphabetical_order) output += " $\\dagger$ Authors listed alphabetically.";
  if (publication.equal_contribution?.length) output += " $^*$ Equal contribution.";
  if (publication.status) output += " \\textbf{(" + latex(publication.status) + ")}";
  return output;
}

function replaceHtmlBlock(source, name, content) {
  const start = "<!-- GENERATED:" + name + ":START -->";
  const end = "<!-- GENERATED:" + name + ":END -->";
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  if (first < 0 || last < 0 || last < first) fail("Missing HTML generation markers for " + name);
  if (source.indexOf(start, first + start.length) >= 0) fail("Duplicate HTML start marker for " + name);
  return source.slice(0, first + start.length) + "\n" + content.trim() + "\n" + source.slice(last);
}

function replaceTexBlock(source, name, content) {
  const start = "% GENERATED:" + name + ":START";
  const end = "% GENERATED:" + name + ":END";
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  if (first < 0 || last < 0 || last < first) fail("Missing LaTeX generation markers for " + name);
  return source.slice(0, first + start.length) + "\n" + content.trim() + "\n" + source.slice(last);
}

function timelineItem(date, title, details = []) {
  const detailHtml = details.filter(Boolean).map((detail) =>
    '                  <p class="font-regular text-sm text-paragraph">' + detail + "</p>"
  ).join("\n");
  return [
    "                <div class=\"relative ml-3 pl-6 pb-5 after:absolute after:top-0 after:left-0 after:mt-2 after:-ml-[0.6px] after:h-full after:w-[1px] after:bg-body after:content-[''] sm:ml-4 sm:pl-8\">",
    '                  <span class="absolute top-1 -left-[5px] z-10 rounded-full bg-primary p-[5px]"></span>',
    date ? '                  <p class="font-regular text-sm text-paragraph">' + escapeHtml(date) + "</p>" : "",
    title ? '                  <h2 class="mt-1 mb-2 text-lg font-medium text-heading">' + title + "</h2>" : "",
    detailHtml,
    "                </div>",
  ].filter(Boolean).join("\n");
}

function compactTimelineItem(date, title, titleSize = "text-md") {
  return [
    "                  <div class=\"relative ml-3 flex flex-col gap-1 pl-6 pb-5 after:absolute after:top-0 after:left-0 after:mt-2 after:-ml-[0.6px] after:h-full after:w-[1px] after:bg-body after:content-[''] sm:ml-4 sm:pl-8\">",
    '                    <span class="absolute top-2 -left-[5px] z-10 rounded-full bg-primary p-[5px]"></span>',
    '                    <h2 class="' + titleSize + ' font-medium text-heading">' + title + "</h2>",
    '                    <p class="font-regular text-sm text-paragraph">' + escapeHtml(date) + "</p>",
    "                  </div>",
  ].join("\n");
}

function yearsOnly(dates) {
  const years = String(dates).match(/\b(?:19|20)\d{2}\b/g) || [];
  const tail = /Present|Current/.exec(String(dates));
  if (years.length >= 2) return years[0] + "-" + years.at(-1);
  if (years.length === 1 && tail) return years[0] + "-" + tail[0];
  return years[0] || String(dates);
}

function renderMetadata(data) {
  const name = escapeAttr(data.profile.name);
  const description = escapeAttr(data.profile.summary.split(". ")[0] + ".");
  const canonical = escapeAttr(data.profile.website + "/");
  return [
    '  <meta name="description" content="' + description + '" />',
    '  <meta name="author" content="' + name + '" />',
    "  <title>" + name + " | Applied Mathematics &amp; Scientific ML</title>",
    '  <link rel="canonical" href="' + canonical + '" />',
    "",
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:url" content="' + canonical + '" />',
    '  <meta property="og:title" content="' + name + ' | Applied Mathematics &amp; Scientific ML" />',
    '  <meta property="og:description" content="' + description + '" />',
    '  <meta property="og:image" content="' + escapeAttr(data.profile.website) + '/assets/images/social-preview.png" />',
    '  <meta property="og:image:width" content="1200" />',
    '  <meta property="og:image:height" content="630" />',
    '  <meta property="og:image:alt" content="' + name + ' - Applied Mathematics and Scientific Machine Learning" />',
    '  <meta name="twitter:card" content="summary_large_image" />',
    '  <meta name="twitter:title" content="' + name + ' | Applied Mathematics &amp; Scientific ML" />',
    '  <meta name="twitter:description" content="' + description + '" />',
    '  <meta name="twitter:image" content="' + escapeAttr(data.profile.website) + '/assets/images/social-preview.png" />',
  ].join("\n");
}

function renderProfileHeading(data, mobile) {
  const headingClass = mobile ? "mb-1 text-3xl font-bold text-heading" : "mt-5 mb-1 text-2xl font-bold text-heading";
  return [
    '          <h2 class="' + headingClass + '">' + escapeHtml(data.profile.name) + "</h2>",
    "          <p>" + data.profile.headline.map(escapeHtml).join("<br/>") + "</p>",
    ...(mobile ? [
      '          <div class="mt-4 flex flex-col items-center gap-3">',
      renderProfileEmails(data),
      renderProfileLocations(data),
      "          </div>",
    ] : []),
  ].join("\n");
}

function mailIcon() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">',
    '<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />',
    "</svg>",
  ].join("");
}

function renderProfileEmails(data) {
  return data.profile.emails.map((email) => [
    '            <span class="flex items-center">',
    "              " + mailIcon(),
    '              <a href="mailto:' + escapeAttr(email) + '" class="hover:text-heading hover:underline">' + escapeHtml(email) + "</a>",
    "            </span>",
  ].join("\n")).join("\n");
}

function renderProfileLocations(data) {
  return data.profile.locations.map((location) => [
    '            <span class="flex items-center">',
    '              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">',
    '                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />',
    '                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />',
    "              </svg>",
    '              <a href="' + escapeAttr(location.url) + '" class="hover:text-heading hover:underline">' + escapeHtml(location.label) + "</a>",
    "            </span>",
  ].join("\n")).join("\n");
}

function renderContactEmail(data) {
  const email = data.profile.emails[0];
  return '<p class="text-sm">Email me at <a id="contact-email" href="mailto:' + escapeAttr(email) + '" class="text-primary underline">' + escapeHtml(email) + '</a> or use the form below.</p>';
}

function renderAbout(data) {
  const mission = data.profile.research_mission;
  const recruitment = data.profile.recruitment_announcement;
  const educationCards = [...data.education].reverse().map((entry) => [
    '                <div class="group my-5 sm:mx-5 sm:my-0" style="width:33%">',
    '                  <span class="flex h-10 w-10 items-center justify-center rounded-md bg-primary transition-all duration-700 group-hover:rotate-[360deg]">',
    '                    <img class="h-8 w-8" src="assets/icons/college.svg" alt="College"/>',
    "                  </span>",
    '                  <h2 class="mt-3 mb-1 text-base font-medium text-heading">' + escapeHtml(entry.institution) + "</h2>",
    '                  <h2 class="mt-3 mb-1 text-base font-medium text-heading">' + escapeHtml(entry.degree) + " (" + escapeHtml(yearsOnly(entry.dates)) + ")</h2>",
    '                  <p class="text-sm leading-relaxed text-paragraph">' + escapeHtml(entry.site_summary) + "</p>",
    "                </div>",
  ].join("\n"));
  const postdoc = data.employment.find((entry) => entry.id === "caltech-postdoc");
  educationCards.push([
    '                <div class="group my-5 sm:mx-5 sm:my-0" style="width:33%">',
    '                  <span class="flex h-10 w-10 items-center justify-center rounded-md bg-primary transition-all duration-700 group-hover:rotate-[360deg]">',
    '                    <img class="h-8 w-8" src="assets/icons/college.svg" alt="College"/>',
    "                  </span>",
    '                  <h2 class="mt-3 mb-1 text-base font-medium text-heading">' + escapeHtml(postdoc.institution) + "</h2>",
    '                  <h2 class="mt-3 mb-1 text-base font-medium text-heading">Postdoc (' + escapeHtml(yearsOnly(postdoc.dates)) + ")</h2>",
    '                  <p class="text-sm leading-relaxed text-paragraph">NSF MSPRF Postdoctoral Researcher</p>',
    "                </div>",
  ].join("\n"));

  const goalProjects = {
    I: { label: "Scientific Modeling", group: "de", image: "netinf.png" },
    II: { label: "Optimal Transport", group: "ot", image: "splines.png" },
    III: { label: "Inverse Problems", group: "ip", image: "spectral_volterra.png" },
  };
  const goals = mission.thrusts.map((thrust) => {
    const project = goalProjects[thrust.label];
    return [
      '                <li class="research-goal">',
      '                  <p class="research-goal-copy"><span class="research-goal-number">(' + escapeHtml(thrust.label) + ')</span><span><strong>' + escapeHtml(thrust.lead) + '</strong> ' + escapeHtml(thrust.detail) + '</span></p>',
      '                  <button type="button" class="site-to-portfolio research-goal-link" data-research-group="' + project.group + '" aria-label="See ' + escapeAttr(project.label.toLowerCase()) + ' projects for research goal ' + escapeAttr(thrust.label) + '">',
      '                    <img src="assets/images/portfolios/' + project.image + '" alt="" width="88" height="64" loading="lazy" />',
      '                    <span class="research-goal-link-copy"><span class="research-goal-link-title">' + escapeHtml(project.label) + '</span><span class="research-goal-link-action">See projects</span></span>',
      '                  </button>',
      '                </li>',
    ].join("\n");
  }).join("\n");

  return [
    '            <div class="mb-10">',
    '              <aside class="news-panel news-panel--recruiting mb-6" aria-labelledby="recruitment-heading">',
    '                <h3 id="recruitment-heading" class="news-panel-label">News</h3>',
    '                <p class="news-panel-copy"><strong>' + escapeHtml(recruitment.lead) + '</strong> ' + escapeHtml(recruitment.text) + "</p>",
    '                <ul class="news-panel-copy news-panel-links">',
    recruitment.links.map((link) =>
      '                  <li><a class="hover:underline" href="' + escapeAttr(link.url) + '">' + escapeHtml(link.label) + "</a></li>"
    ).join("\n"),
    "                </ul>",
    "              </aside>",
    '              <aside class="news-panel mb-6" aria-labelledby="announcement-heading">',
    '                <h3 id="announcement-heading" class="news-panel-label">News</h3>',
    '                <p class="news-panel-copy">' + markdownLinks(data.profile.announcement) + "</p>",
    "              </aside>",
    '              <div class="text-justify text-sm leading-relaxed">',
    data.profile.biography.map((paragraph) => '                <p class="mb-4">' + markdownLinks(paragraph) + "</p>").join("\n"),
    '                <p>' + escapeHtml(data.profile.summary) + "</p>",
    "              </div>",
    "            </div>",
    "",
    '            <section class="mb-14 sm:mb-16" aria-labelledby="research-mission-heading">',
    '              <h2 id="research-mission-heading" class="mb-3 text-2xl font-semibold text-heading">Research Mission</h2>',
    '              <p class="mb-5 text-base leading-relaxed"><i>' + escapeHtml(mission.question) + "</i></p>",
    '              <ol class="research-goals" role="list">',
    goals,
    "              </ol>",
    '              <p class="text-base leading-relaxed">' + escapeHtml(mission.closing) + "</p>",
    "            </section>",
    "",
    '            <div class="mb-11 md:mb-16">',
    '              <h2 class="text-2xl font-semibold text-heading">Education</h2>',
    '              <div class="mb-5"></div>',
    '              <div class="flex flex-col sm:flex-row">',
    educationCards.join("\n"),
    "              </div>",
    "            </div>",
    "",
    '            <section aria-labelledby="news-highlights-heading">',
    '              <h2 id="news-highlights-heading" class="mb-6 text-2xl font-semibold text-heading">News Highlights</h2>',
    '              <ol class="grid gap-4 sm:grid-cols-2" role="list">',
    data.news.map((item) => [
      '                <li class="news-panel">',
      '                  <p class="news-panel-label">' + escapeHtml(item.date) + "</p>",
      '                  <h3 class="news-panel-copy">' + escapeHtml(item.title) + "</h3>",
      "                </li>",
    ].join("\n")).join("\n"),
    "              </ol>",
    "            </section>",
  ].join("\n");
}

function renderPublicationModal(publication) {
  const venue = publication.status || publication.venue;
  return [
    '<template id="modal-publication-' + escapeAttr(publication.id) + '">',
    '  <h1 class="text-xl font-medium text-heading">' + escapeHtml(publication.title) + "</h1>",
    '  <h2 class="text-sm font-normal text-paragraph">' + webAuthors(publication) + "</h2>",
    '  <a href="' + escapeAttr(publication.url) + '" class="flex items-center text-sm text-primary hover:underline w-fit"><span>' + escapeHtml(publication.url) + "</span></a>",
    '  <img src="assets/images/portfolio-details/' + escapeAttr(publication.image) + '" class="w-full mh-64 object-cover rounded-md my-7" alt="' + escapeAttr(publication.image_alt || publication.title) + '" />',
    ...(publication.image_caption ? ['  <p class="text-xs text-paragraph mb-5">' + escapeHtml(publication.image_caption) + '</p>'] : []),
    ...(publication.thumbnail ? ['  <a href="assets/images/portfolios/' + escapeAttr(publication.image) + '" target="_blank" rel="noopener" class="inline-block text-sm text-primary hover:underline mb-5">View full figure from the research card</a>'] : []),
    '  <ul class="flex flex-col gap-2.5 text-paragraph text-sm">',
    '    <li><b class="font-medium text-heading">Venue:</b> ' + escapeHtml(venue) + "</li>",
    '    <li><b class="font-medium text-heading">Date:</b> ' + escapeHtml(publication.published_date) + "</li>",
    '    <li><b class="font-medium text-heading">Keywords:</b> ' + publication.keywords.map(escapeHtml).join(", ") + "</li>",
    "  </ul>",
    '  <h2 class="text-base text-heading font-medium mt-7 mb-3">' + escapeHtml(publication.abstract_label || "Abstract") + '</h2>',
    '  <p class="text-sm text-paragraph font-normal text-justify">' + escapeHtml(publication.abstract) + "</p>",
    "</template>",
  ].join("\n");
}

function renderResearchFigure(publication) {
  const source = "assets/images/portfolios/" + escapeAttr(publication.image);
  const alt = escapeAttr(publication.thumbnail?.alt || publication.image_alt || publication.title);
  if (!publication.thumbnail) {
    return '<img class="research-card-thumbnail" src="' + source + '" alt="' + alt + '" />';
  }
  const { crop } = publication.thumbnail;
  const [x, y, width, height] = crop;
  const size = researchImageSize(publication);
  const clipId = "figure-crop-" + escapeAttr(publication.id);
  // Clip the selected panel explicitly so adjacent panels cannot enter the SVG's letterboxing.
  return '<svg class="research-card-thumbnail" viewBox="' + crop.join(" ") + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + alt + '" focusable="false">' +
    '<defs><clipPath id="' + clipId + '"><rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" /></clipPath></defs>' +
    '<image href="' + source + '" width="' + size.width + '" height="' + size.height + '" clip-path="url(#' + clipId + ')" /></svg>';
}

function renderResearch(data) {
  const projects = data.publications.filter((publication) => publication.research_card);
  const cards = projects.map((publication) => {
    const groups = JSON.stringify(["all", ...publication.groups]);
    return [
      "              <div data-groups='" + groups + "' class=\"item-portfolio\">",
      '                <div class="research-card open-modal-portfolio" data-modal-id="modal-publication-' + escapeAttr(publication.id) + '">',
      '                  <div class="research-card-figure" style="--figure-padding: ' + (publication.thumbnail?.padding ?? 8) + 'px">',
      '                    ' + renderResearchFigure(publication),
      "                  </div>",
      '                  <div class="research-card-body">',
      '                    <h2 class="text-base font-medium text-heading">' + escapeHtml(publication.title) + "</h2>",
      '                    <p class="text-sm font-normal text-paragraph">' + webAuthors(publication, true) + "</p>",
      '                    <span class="research-card-venue text-xs font-normal text-paragraph">' + escapeHtml(publication.card_venue) + ", " + escapeHtml(publication.year) + "</span>",
      "                  </div>",
      "                </div>",
      "              </div>",
    ].join("\n");
  }).join("\n");
  return [
    '            <div id="wrapper-portfolio">',
    cards,
    "            </div>",
    projects.map(renderPublicationModal).join("\n"),
  ].join("\n");
}

function renderTeachingModal(course) {
  return [
    '<template id="modal-teaching-' + escapeAttr(course.id) + '">',
    '  <span class="block text-sm text-paragraph mb-2">' + escapeHtml(course.term + " | " + course.institution_short) + "</span>",
    '  <h1 class="text-xl font-medium text-heading">' + escapeHtml(course.code + " " + course.title) + "</h1>",
    '  <a href="' + escapeAttr(course.url) + '" class="flex items-center text-sm text-primary hover:underline w-fit"><span>' + escapeHtml(course.url) + "</span></a>",
    '  <h2 class="text-base text-heading font-medium mt-7 mb-3">Overview</h2>',
    '  <p class="text-sm text-paragraph font-normal text-justify">' + escapeHtml(course.overview) + "</p>",
    '  <h2 class="text-base text-heading font-medium mt-7 mb-3">Responsibility</h2>',
    '  <p class="text-sm text-paragraph font-normal text-justify">' + escapeHtml(course.responsibility) + "</p>",
    "</template>",
  ].join("\n");
}

function renderCourseCard(course) {
  return [
    '              <div class="open-modal-blog group w-full cursor-pointer rounded-md border border-body" data-modal-id="modal-teaching-' + escapeAttr(course.id) + '">',
    '                <div class="p-5">',
    '                  <span class="mb-2 block text-xs font-normal text-paragraph">' + escapeHtml(course.term + " | " + course.institution_short) + "</span>",
    '                  <h2 class="text-base font-medium text-heading">' + escapeHtml(course.code + " " + course.title) + "</h2>",
    "                </div>",
    "              </div>",
  ].join("\n");
}

function renderMentoringItem(item) {
  if (item.entries) {
    return [
      '              <h2 class="mt-1 mb-2 text-lg font-medium text-heading">(' + escapeHtml(item.program) + ") " + escapeHtml(item.institution) + "</h2>",
      item.entries.map((entry) => timelineItem(entry.dates, escapeHtml(entry.title))).join("\n"),
    ].join("\n");
  }
  const details = [];
  if (item.project) {
    const project = item.url
      ? '<a class="text-primary hover:underline" href="' + escapeAttr(item.url) + '">' + escapeHtml(item.project) + "</a>"
      : escapeHtml(item.project);
    details.push(project + (item.description ? ": <em>" + escapeHtml(item.description) + "</em>" : ""));
  } else if (item.description) {
    details.push("<em>" + escapeHtml(item.description) + "</em>");
  }
  if (item.bullets) {
    details.push('<ul class="list-disc list-inside">' + item.bullets.map((bullet) => "<li>" + escapeHtml(bullet) + "</li>").join("") + "</ul>");
  }
  if (item.note) {
    details.push(item.note_url
      ? '<a class="text-primary hover:underline" href="' + escapeAttr(item.note_url) + '">' + escapeHtml(item.note) + "</a>"
      : escapeHtml(item.note));
  }
  return [
    '              <h2 class="mt-1 mb-2 text-lg font-medium text-heading">(' + escapeHtml(item.program) + ") " + escapeHtml(item.institution) + "</h2>",
    timelineItem(item.dates, escapeHtml(item.headline), details),
  ].join("\n");
}

function renderTeaching(data) {
  const instructors = data.teaching.filter((course) => course.category === "instructor");
  const assistants = data.teaching.filter((course) => course.category === "teaching_assistant");
  const philosophy = data.profile.teaching_philosophy;
  return [
    '            <h2 class="mb-6 text-2xl font-semibold text-heading">Teaching Philosophy</h2>',
    '            <p class="mb-5 text-sm leading-relaxed">' + escapeHtml(philosophy.intro) + "</p>",
    '            <ol class="mb-5 text-sm leading-relaxed">',
    philosophy.principles.map((principle, index) => "              <li><b>(" + (index + 1) + ".)</b> " + escapeHtml(principle) + "</li>").join("\n"),
    "            </ol>",
    '            <p class="mb-5 text-sm leading-relaxed">' + escapeHtml(philosophy.closing) + "</p>",
    "            <br>",
    '            <h2 class="mb-6 text-2xl font-semibold text-heading">Instructor of Record</h2>',
    '            <div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">',
    instructors.map(renderCourseCard).join("\n"),
    "            </div>",
    "            <br>",
    '            <h2 class="mb-6 text-2xl font-semibold text-heading">Teaching Assistant</h2>',
    '            <div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">',
    assistants.map(renderCourseCard).join("\n"),
    "            </div>",
    "            <br><br>",
    '            <div class="mb-10">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Mentorship and Outreach</h2>',
    data.mentoring.map(renderMentoringItem).join("\n"),
    "            </div>",
    '            <div class="mb-12">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Service and Leadership</h2>',
    data.service.map((item) => compactTimelineItem(item.dates, escapeHtml(item.title))).join("\n"),
    "            </div>",
    '            <div class="mb-12">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Professional Membership</h2>',
    data.memberships.map((item) => compactTimelineItem(item.dates, escapeHtml(item.name))).join("\n"),
    "            </div>",
    data.teaching.map(renderTeachingModal).join("\n"),
  ].join("\n");
}

function renderEmploymentWeb(data) {
  return [
    '            <div class="mb-10">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Academic Employment</h2>',
    data.employment.map((item) => {
      const details = [];
      if (item.title) details.push("<em>" + escapeHtml(item.title) + "</em>");
      if (item.department) details.push(escapeHtml(item.department));
      if (item.advisor) details.push("Postdoctoral Advisor: " + (item.advisor.url
        ? '<a class="hover:text-primary hover:underline" href="' + escapeAttr(item.advisor.url) + '">' + escapeHtml(item.advisor.name) + "</a>"
        : escapeHtml(item.advisor.name)));
      return timelineItem(item.dates, escapeHtml(item.institution + " (" + item.role + ")"), details);
    }).join("\n"),
    "            </div>",
  ].join("\n");
}

function renderEducationWeb(data) {
  return [
    '            <div class="mb-10">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Education</h2>',
    data.education.map((item) => {
      const details = [escapeHtml(item.department)];
      details.push("GPA: " + escapeHtml(item.gpa));
      details.push("Advisors: " + oxford(item.advisors.map((advisor) =>
        '<a class="hover:text-primary hover:underline" href="' + escapeAttr(advisor.url) + '">' + escapeHtml(advisor.name) + "</a>"
      )));
      if (item.thesis) details.push('Thesis: <a class="hover:text-primary hover:underline" href="' + escapeAttr(item.thesis.url) + '"><em>' + escapeHtml(item.thesis.title) + "</em></a>");
      if (item.research_topic) details.push('Research Topic: <a class="hover:text-primary hover:underline" href="' + escapeAttr(item.research_topic.url) + '"><em>' + escapeHtml(item.research_topic.title) + "</em></a>");
      return timelineItem(item.dates, escapeHtml(item.institution + " (" + item.degree + ")"), details);
    }).join("\n"),
    "            </div>",
  ].join("\n");
}

function renderAwardsWeb(data) {
  return [
    '            <div class="mb-12">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Academic Awards</h2>',
    data.awards.map((item) => {
      let title = escapeHtml(item.short_name || item.name);
      if (item.url) title = '<a class="hover:text-primary hover:underline" href="' + escapeAttr(item.url) + '">' + title + "</a>";
      if (item.note) title += " (" + escapeHtml(item.note) + ")";
      return compactTimelineItem(item.dates, title, "text-lg");
    }).join("\n"),
    "            </div>",
  ].join("\n");
}

const PUBLICATION_LABELS = {
  thesis: "Thesis",
  preprint: "Preprints",
  review: "Manuscripts in Review",
  journal: "Journal Articles",
  conference: "Conference Proceedings",
  preparation: "In Preparation",
};

function visiblePublications(data, target) {
  return data.publications.filter((publication) => {
    if (publication[target] === false) return false;
    return Object.hasOwn(PUBLICATION_LABELS, publication.category);
  });
}

function renderPublicationsWeb(data) {
  const records = visiblePublications(data, "site_cv");
  const groups = Object.keys(PUBLICATION_LABELS).map((category) => {
    const items = records.filter((publication) => publication.category === category);
    if (!items.length) return "";
    return [
      '              <h2 class="mt-1 mb-2 text-lg font-medium text-heading">' + PUBLICATION_LABELS[category] + "</h2>",
      items.map((publication) => timelineItem("", "", [publication.url
        ? '<a class="hover:text-primary hover:underline" href="' + escapeAttr(publication.url) + '">' + webCitation(publication) + "</a>"
        : webCitation(publication)])).join("\n"),
    ].join("\n");
  }).filter(Boolean).join("\n");
  return [
    '            <div class="mb-10">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Publications</h2>',
    '              <p class="mb-5 text-sm leading-relaxed text-paragraph">See also my <a class="hover:text-primary hover:underline" href="' + escapeAttr(data.meta.update_sources[1].url) + '">Google Scholar</a> and <a class="hover:text-primary hover:underline" href="' + escapeAttr(data.meta.update_sources[0].url) + '">ORCID</a>.</p>',
    groups,
    "            </div>",
  ].join("\n");
}

const TALK_LABELS = {
  organized: "Organized Symposia",
  invited: "Invited Talks",
  contributed: "Contributed Talks",
  poster: "Poster Presentations",
};

function talkHtml(item) {
  let output = "&ldquo;" + escapeHtml(item.title) + "&rdquo;, " + escapeHtml(item.event);
  if (item.location) output += ", " + escapeHtml(item.location);
  if (item.date) output += ", " + escapeHtml(item.date);
  if (item.note) output += " <strong>(" + escapeHtml(item.note) + ")</strong>";
  if (item.url) output += ' <a class="hover:text-primary hover:underline" href="' + escapeAttr(item.url) + '">Link</a>';
  return output;
}

function renderTalksWeb(data) {
  return [
    '            <div class="mb-10">',
    '              <h2 class="mb-6 text-2xl font-semibold text-heading">Talks and Presentations</h2>',
    Object.keys(TALK_LABELS).map((type) => [
      '              <h2 class="mt-5 mb-2 text-lg font-medium text-heading">' + TALK_LABELS[type] + "</h2>",
      '              <ul class="mb-5 list-disc pl-5 text-sm leading-relaxed text-paragraph">',
      data.talks.filter((talk) => talk.type === type).map((talk) => "                <li>" + talkHtml(talk) + "</li>").join("\n"),
      "              </ul>",
    ].join("\n")).join("\n"),
    "            </div>",
  ].join("\n");
}

function renderWebCv(data) {
  return [
    renderEmploymentWeb(data),
    renderEducationWeb(data),
    renderAwardsWeb(data),
    renderPublicationsWeb(data),
    renderTalksWeb(data),
  ].join("\n");
}

function renderTexEmployment(data) {
  return [
    "\\section{Academic Employment}",
    data.employment.map((item) => {
      const rows = [
        latexDate(item.dates) + " & \\textbf{" + latex(item.institution + " (" + item.role + ")") + "}\\\\",
      ];
      if (item.title) rows.push("& \\textit{" + latex(item.title) + "}\\\\");
      if (item.department) rows.push("& " + latex(item.department) + "\\\\");
      if (item.advisor) rows.push("& Postdoctoral Advisor: " + texLink(item.advisor.url, item.advisor.name) + "\\\\");
      return "\\begin{tabular}{lp{13cm}}\n" + rows.join("\n") + "\n\\end{tabular}\\\\";
    }).join("\n\n"),
  ].join("\n");
}

function renderTexEducation(data) {
  const rows = data.education.map((item) => {
    const advisors = oxford(item.advisors.map((advisor) => texLink(advisor.url, advisor.name)));
    const result = [
      latexDate(item.dates) + " & \\textbf{" + latex(item.institution + " (" + item.degree + ")") + "}\\\\",
      "\\textsc{\\bf GPA}: " + latex(item.gpa) + " & " + latex(item.department) + "\\\\",
      "& " + (item.degree === "PhD" ? "PhD" : "Undergraduate Research") + " Advisors: " + advisors + "\\\\",
    ];
    if (item.thesis) result.push("& Graduate Thesis: \\textit{" + texLink(item.thesis.url, item.thesis.title) + "}\\\\");
    if (item.research_topic) result.push("& Research Topic: \\textit{" + texLink(item.research_topic.url, item.research_topic.title) + "}\\\\");
    result.push("\\\\");
    return result.join("\n");
  }).join("\n");
  return "\\section{Education}\n\\begin{tabular}{lp{13cm}}\n" + rows + "\n\\end{tabular}\\\\";
}

function renderTexAwards(data) {
  const rows = data.awards.map((item) => {
    let label = latex(item.short_name || item.name);
    if (item.award_number && item.url) {
      label += " " + texLink(item.url, item.award_number);
    } else if (item.url) {
      label += " " + texPaperclip(item.url);
    }
    if (item.note) label += " (" + latex(item.note) + ")";
    return label + " & " + latexDate(item.dates) + "\\\\";
  });
  return [
    "\\section{Academic Awards}",
    "\\renewcommand{\\arraystretch}{1.3}",
    "\\begin{tabularx}{\\textwidth}{X|r}",
    rows.join("\n"),
    "\\end{tabularx}",
    "\\vspace{10pt}",
  ].join("\n");
}

function renderTexPublications(data) {
  const records = visiblePublications(data, "resume");
  const codes = { thesis: "T", preprint: "PP", review: "R", journal: "J", conference: "C", preparation: "P" };
  const groups = Object.keys(PUBLICATION_LABELS).map((category) => {
    const items = records.filter((publication) => publication.category === category);
    if (!items.length) return "";
    const body = items.map((publication) => {
      const clip = texPaperclip(publication.url);
      return "\\item " + (clip ? clip + "~ " : "") + texCitation(publication);
    }).join("\n\n");
    return [
      "\\subsubsection*{" + PUBLICATION_LABELS[category] + "}",
      "\\begin{enumerate}[label={[" + codes[category] + "\\arabic*]}, leftmargin=*]",
      body,
      "\\end{enumerate}",
    ].join("\n");
  }).filter(Boolean).join("\n\n");
  return [
    "\\section{Publications}",
    "Please see also my " + texLink(data.meta.update_sources[1].url, "Google Scholar") + " and " + texLink(data.meta.update_sources[0].url, "ORCID ID") + ". ($\\dagger$ alphabetical order, $^*$ joint first author)",
    "\\vspace{-7pt}",
    groups,
    "\\vspace{10pt}",
  ].join("\n");
}

function talkTex(item) {
  let output = "``" + latex(item.title) + "'', " + latex(item.event);
  if (item.location) output += ", " + (item.emphasize_location ? "\\textbf{" + latex(item.location) + "}" : latex(item.location));
  if (item.date) output += ", " + latexDate(item.date);
  if (item.note) output += " \\textbf{(" + latex(item.note) + ")}";
  if (item.url) output += " " + texPaperclip(item.url);
  return output;
}

function renderTexTalks(data) {
  return [
    "\\section{Talks and Presentations}",
    Object.keys(TALK_LABELS).map((type) => [
      "\\subsubsection*{" + TALK_LABELS[type] + "}",
      "\\begin{itemize}",
      data.talks.filter((talk) => talk.type === type).map((talk) => "\\item " + talkTex(talk)).join("\n\n"),
      "\\end{itemize}",
    ].join("\n")).join("\n\n"),
  ].join("\n");
}

function renderTexTeaching(data) {
  return [
    "\\section*{Teaching Experience}",
    data.teaching.map((course) => [
      "\\begin{tabularx}{\\textwidth}{@{}X|>{\\raggedleft\\arraybackslash}p{2.2cm}@{}}",
      "\\textbf{(" + latex(course.code) + ") " + latex(course.institution) + " -- " + latex(course.role) + "} " + texPaperclip(course.url) + " & " + latexDate(course.term) + "\\\\[2pt]",
      latex(course.resume_subtitle) + "\\\\",
      "\\textit{" + latex(course.resume_detail) + "}",
      "\\end{tabularx}",
      "\\vspace{10pt}",
    ].join("\n")).join("\n\n"),
  ].join("\n");
}

function renderTexMentoring(data) {
  const records = data.mentoring.map((item) => {
    if (item.entries) {
      const rows = [
        "\\textbf{(" + latex(item.program) + ") " + latex(item.institution) + "}\\\\",
        ...item.entries.map((entry) => latex(entry.title) + " & " + latexDate(entry.dates) + "\\\\"),
      ];
      return "\\begin{tabularx}{\\textwidth}{@{}X|>{\\raggedleft\\arraybackslash}p{2.2cm}@{}}\n" + rows.join("\n") + "\n\\end{tabularx}\n\\vspace{10pt}";
    }
    const rows = [
      "\\textbf{(" + latex(item.program) + ") " + latex(item.institution) + "} & " + latexDate(item.dates) + "\\\\[2pt]",
      latex(item.headline) + (item.bullets ? "" : "\\\\"),
    ];
    if (item.project) {
      const project = item.url ? texLink(item.url, item.project) : latex(item.project);
      rows.push(project + ": \\textit{" + latex(item.description) + "}");
    } else if (item.description) {
      rows.push("\\textit{" + latex(item.description) + "}");
    }
    if (item.bullets) {
      rows.push("\\begin{itemize}\n" + item.bullets.map((bullet) => "  \\item " + latex(bullet)).join("\n") + "\n\\end{itemize}");
    }
    if (item.note) rows.push("\\\\\n\\underline{\\smash{" + latex(item.note) + "}} " + texPaperclip(item.note_url));
    return "\\begin{tabularx}{\\textwidth}{@{}X|>{\\raggedleft\\arraybackslash}p{2.2cm}@{}}\n" + rows.join("\n") + "\n\\end{tabularx}\n\\vspace{10pt}";
  }).join("\n\n");
  return "\\section*{Mentoring Experience}\n" + records;
}

function renderTexService(data) {
  return [
    "\\section{Service and Leadership}",
    "\\begin{enumerate}",
    data.service.map((item) => {
      let output = "  \\item " + latex(item.title) + " " + latexDate(item.dates);
      if (item.url) output += " " + texPaperclip(item.url);
      return output;
    }).join("\n"),
    "\\end{enumerate}",
    "\\vspace{10pt}",
  ].join("\n");
}

function renderTexMemberships(data) {
  return [
    "\\section{Professional Membership}",
    "\\begin{itemize}",
    data.memberships.map((item) => "  \\item " + latex(item.name) + " " + latexDate(item.dates)).join("\n"),
    "\\end{itemize}",
    "\\vspace{10pt}",
  ].join("\n");
}

function renderTex(data) {
  const email = data.profile.emails[0];
  const header = [
    "\\par{\\centerline{",
    "  {\\Huge " + latex(data.profile.name) + "}}\\bigskip",
    "  \\centerline{" + texLink("mailto:" + email, email) + " \\,|\\, " + texLink(data.profile.website, data.profile.website) + "}",
    "}\\bigskip",
    "",
    latex(data.profile.summary),
  ].join("\n");
  return [
    header,
    renderTexEmployment(data),
    renderTexEducation(data),
    renderTexAwards(data),
    renderTexPublications(data),
    renderTexTalks(data),
    renderTexTeaching(data),
    renderTexMentoring(data),
    renderTexService(data),
    renderTexMemberships(data),
  ].join("\n\n");
}

function updateFile(filePath, next) {
  const current = fs.readFileSync(filePath, "utf8");
  if (current === next) return false;
  if (CHECK) {
    console.error(path.relative(ROOT, filePath) + " is out of date");
    return true;
  }
  fs.writeFileSync(filePath, next);
  console.log("Updated " + path.relative(ROOT, filePath));
  return true;
}

const data = yaml.load(fs.readFileSync(DATA_PATH, "utf8"), { schema: yaml.JSON_SCHEMA });
validate(data);

let index = fs.readFileSync(INDEX_PATH, "utf8");
index = replaceHtmlBlock(index, "PROFILE_METADATA", renderMetadata(data));
index = replaceHtmlBlock(index, "PROFILE_SIDEBAR", renderProfileHeading(data, false));
index = replaceHtmlBlock(index, "PROFILE_EMAILS", renderProfileEmails(data));
index = replaceHtmlBlock(index, "PROFILE_LOCATIONS", renderProfileLocations(data));
index = replaceHtmlBlock(index, "PROFILE_MOBILE", renderProfileHeading(data, true));
index = replaceHtmlBlock(index, "CONTACT_EMAIL", renderContactEmail(data));
index = replaceHtmlBlock(index, "ABOUT", renderAbout(data));
index = replaceHtmlBlock(index, "RESEARCH", renderResearch(data));
index = replaceHtmlBlock(index, "TEACHING", renderTeaching(data));
index = replaceHtmlBlock(index, "WEB_CV", renderWebCv(data));

let tex = fs.readFileSync(TEX_PATH, "utf8");
tex = replaceTexBlock(tex, "ACADEMIC_PROFILE", renderTex(data));

const stale = [
  updateFile(INDEX_PATH, index),
  updateFile(TEX_PATH, tex),
].some(Boolean);

if (CHECK && stale) process.exitCode = 1;
if (!stale) console.log(CHECK ? "Generated content is current" : "No generated content changes");
