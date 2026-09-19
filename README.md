# George Stepaniants Personal Website

This is a static, single-page academic portfolio hosted with GitHub Pages.

- `content/academic-profile.yaml` is the authoritative source for academic and resume content.
- `index.html` contains the About, Research, Teaching, CV, and Contact tabs. Sections between `GENERATED` comments are rebuilt from the YAML and should not be edited directly.
- `assets/` contains the compiled styles, JavaScript, images, and icons.
- `resume/` contains both the LaTeX CV source and the PDF embedded by the site.

## Updating the website and CV

Edit `content/academic-profile.yaml`, then run `npm run update` from the repository root. This validates the YAML, regenerates the website and LaTeX content, and compiles the PDF. XeLaTeX auxiliary files stay in `resume/.build/`; run `npm run clean` to remove them.

Research figures can set `thumbnail.crop: [x, y, width, height]` in source-image pixels, `thumbnail.padding` in display pixels, and `thumbnail.alt` to describe a selected panel. Crops are applied in the page without modifying the PNGs; each pop-up links to the full card figure. Use `npm run content:render` for changes that only affect the website.

Run `npm run check` to verify that generated content is current and the JavaScript is valid. For an AI-assisted review of official sources, use `prompts/review-academic-updates.md`; it is deliberately review-first and never publishes automatically.

## Contact details and form delivery

The first address in `profile.emails` is the primary contact shown on the website and CV. Additional addresses appear as secondary contacts on the front page. `profile.locations` supplies the desktop and mobile location links.

The contact form uses EmailJS through `assets/js/contact-form.js`, independently of the website navigation script. It uses Gmail service `service_jjj269v` and template `template_k0xotgp`. George supplied the replacement service ID on September 19, 2026 after successfully connecting Gmail. Change these identifiers only using settings from George's EmailJS account.

The Formspree action inherited from the original theme has been removed. It was bypassed by the EmailJS submit handler, and its ownership could not be verified. Do not restore it as a fallback. The Send button stays disabled until the EmailJS handler is ready; a direct email link remains available if JavaScript or delivery fails. Failed sends preserve the visitor's message and display an error instead of failing silently.

Form submissions should be delivered to `georgestepaniants@gmail.com`. Keep `gs852@cam.ac.uk` as the direct-email suggestion above the form and in its failure message. These addresses serve different purposes: connecting a Gmail service chooses the sending account, while the EmailJS template controls the recipient.

In the [EmailJS template dashboard](https://dashboard.emailjs.com/admin/templates), open `template_k0xotgp` and set **To Email** to `georgestepaniants@gmail.com`, **Reply-To** to `{{email}}`, and **From Email** to the connected service's default address. The form also provides `name` and `message`. Use the successfully connected Gmail service's actual ID in `assets/js/contact-form.js`, then send a clearly labeled browser test and confirm receipt in Gmail. The recipient setting cannot be verified or changed solely through this repository. See [EmailJS's template instructions](https://www.emailjs.com/docs/tutorial/creating-email-template/).

The September 19, 2026 browser test using the previous service `service_ut1dtwz` returned `412: Gmail_API: Invalid grant. Please reconnect your Gmail account`. George subsequently confirmed that the replacement service `service_jjj269v` was connected successfully and the template recipient was set to Gmail. A real test from the local website preview using the replacement service succeeded: EmailJS accepted the request, the form showed its success message, and the fields reset. Inbox receipt still needs confirmation from George.

The September 19, 2026 command-line EmailJS test returned HTTP 403 because the account disables non-browser API requests; this does not establish that browser submissions fail. Do not weaken that setting just to run a command-line test. A test sent to the old Formspree URL was accepted, but its recipient and inbox delivery were never verified and it is not evidence of successful delivery to George.
