/* ============================
  script.js for SpartanDev
  - Replace placeholders below
  - See comments for Google Apps Script sample
   ============================ */

/* ------------- CONFIG ------------- */
const FORMSUBMIT_EMAIL = "your@email.com"; // <- replace with your FormSubmit target email
const WHATSAPP_NUMBER = "91XXXXXXXXXX";    // <- replace with your WA number, e.g. 919876543210
const GSHEET_WEBAPP_URL = "";              // <- optional: your Google Apps Script Web App URL

/* ------------- Google Apps Script Example (for saving leads + autoresponse)
  Create a Google Sheet, open Extensions -> Apps Script and paste this code.
  Deploy as Web App (Execute as: Me, Access: Anyone) and use the deployed URL in GSHEET_WEBAPP_URL.

  -----------------------------------
  function doPost(e) {
    try {
      var data = JSON.parse(e.postData.contents);
      var sheet = SpreadsheetApp.openById("YOUR_SHEET_ID").getSheetByName("Sheet1");
      sheet.appendRow([new Date(), data.name, data.email, data.phone, data.service, data.message]);

      // autoresponse email
      var clientEmail = data.email;
      var subject = "Thanks for contacting SpartanDev";
      var body = "Hi " + data.name + ",\n\nThank you for reaching out! We received your message and will contact you shortly.\n\n— SpartanDev";
      MailApp.sendEmail(clientEmail, subject, body);

      return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({status:'error',error:err})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  -----------------------------------
  After deploying, set GSHEET_WEBAPP_URL to the deployed URL.
*/

/* ------------- Helpers & DOM ------------- */
document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 900, once: true });

  // basic elements
  const diveBtn = document.getElementById("diveBtn");
  const diveBtnHeader = document.getElementById("diveBtnHeader");
  const modal = document.getElementById("contactModal");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  const leadForm = document.getElementById("leadForm");
  const formStatus = document.getElementById("formStatus");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const yearEl = document.getElementById("year");

  // set year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // DIVE button opens modal
  [diveBtn, diveBtnHeader].forEach(btn => {
    if (btn) btn.addEventListener("click", () => {
      modal.classList.add("show");
    });
  });
  // modal close
  modalClose.addEventListener("click", () => modal.classList.remove("show"));
  modalCancel.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });

  /* ---------- Portfolio filtering ---------- */
  const filterButtons = document.querySelectorAll(".filter");
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      portfolioItems.forEach(item => {
        if (filter === "all") item.style.display = "";
        else item.style.display = item.classList.contains(filter) ? "" : "none";
      });
    });
  });

  /* ---------- Lightbox click ---------- */
  document.querySelectorAll(".portfolio-item").forEach(item => {
    const img = item.querySelector("img");
    const title = item.dataset.title || "";
    const viewBtn = item.querySelector(".view-btn");
    const open = () => {
      lightboxImg.src = img.src;
      const caption = document.getElementById("lightboxCaption");
      if (caption) caption.textContent = title;
      lightbox.classList.add("show");
    };
    img.addEventListener("click", open);
    if (viewBtn) viewBtn.addEventListener("click", open);
  });
  // close lightbox
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.id === "lightboxClose") {
      lightbox.classList.remove("show");
      lightboxImg.src = "";
    }
  });

  /* ---------- Testimonials slider ---------- */
  const slides = document.querySelectorAll(".testimonial-slide");
  let sIndex = 0;
  if (slides.length) {
    slides.forEach((s,i) => s.style.display = i===0 ? "block":"none");
    setInterval(() => {
      slides[sIndex].classList.remove("active");
      slides[sIndex].style.display = "none";
      sIndex = (sIndex + 1) % slides.length;
      slides[sIndex].style.display = "block";
      slides[sIndex].classList.add("active");
    }, 3500);
  }

  /* ---------- Pricing Buy buttons (WhatsApp) ---------- */
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || "Plan";
      const message = `Hi, I'm interested in the ${plan} plan. Please share details.`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  });

  /* ---------- Navbar hide on scroll ---------- */
  const navbar = document.getElementById("navbar");
  let lastScroll = window.scrollY;
  window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 120) {
      // scrolling down
      navbar.classList.add("hidden");
    } else {
      // scrolling up
      navbar.classList.remove("hidden");
    }
    lastScroll = current;
  });

  /* ---------- Lead form submit ---------- */
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formStatus.textContent = "Sending…";
    const fd = new FormData(leadForm);
    const data = {
      name: fd.get("name") || "",
      email: fd.get("email") || "",
      phone: fd.get("phone") || "",
      service: fd.get("service") || "",
      message: fd.get("message") || ""
    };

    // 1) Send to Google Sheets Web App (if provided)
    try {
      if (GSHEET_WEBAPP_URL) {
        await fetch(GSHEET_WEBAPP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        console.log("Saved to Google Sheets");
      }
    } catch(err) {
      console.warn("GSHEET save failed:", err);
    }

    // 2) Send email using FormSubmit.co (simple no-backend email)
    try {
      // FormSubmit expects a POST to https://formsubmit.co/you@domain.com
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_EMAIL)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          message: data.message,
          _subject: `New lead from SpartanDev: ${data.name}`
        })
      });
      console.log("Email sent via FormSubmit (attempt)");
    } catch(err) {
      console.warn("FormSubmit failed:", err);
    }

    // 3) Open WhatsApp for instant notification to you + let user send
    try {
      const text = `New lead:\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service}\nMessage: ${data.message}`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
    } catch(err) {
      console.warn("WhatsApp open failed", err);
    }

    // show success
    formStatus.textContent = "Thanks! We opened WhatsApp and saved your request. We'll contact you shortly.";
    leadForm.reset();
    setTimeout(()=> {
      formStatus.textContent = "";
      modal.classList.remove("show");
    }, 3200);
  });

  /* ---------- Extra: surfacing whatsapp link in contact section ---------- */
  const waLink = document.getElementById("whatsappLink");
  if (waLink) {
    waLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    waLink.textContent = `+${WHATSAPP_NUMBER}`;
  }

}); // DOMContentLoaded end
