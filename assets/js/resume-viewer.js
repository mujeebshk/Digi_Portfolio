/* ═══════════════════════════════════════════════════════════════
   RESUME PDF VIEWER CONTROLLER
   Handles PDF rendering, navigation, and modal logic
   ═══════════════════════════════════════════════════════════════ */

class ResumeViewer {
  constructor() {
    this.pdfDoc = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.isRendering = false;

    // Get PDF.js worker (important for processing)
    if (typeof pdfjsLib !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modal = document.getElementById("resumeModal");
    this.resumeBtn = document.getElementById("resumeViewBtn");
    this.closeBtn = document.getElementById("resumeCloseBtn");
    this.canvas = document.getElementById("resumePdfCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.loader = document.getElementById("resumeLoader");
    this.pageInput = document.getElementById("resumePageInput");
    this.totalPagesSpan = document.getElementById("resumeTotalPages");
    this.prevPageBtn = document.getElementById("resumePrevBtn");
    this.nextPageBtn = document.getElementById("resumeNextBtn");
    this.downloadBtn = document.getElementById("resumeDownloadBtn");
  }

  bindEvents() {
    if (this.resumeBtn) {
      this.resumeBtn.addEventListener("click", () => this.openModal());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeModal());
    }

    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    if (this.pageInput) {
      this.pageInput.addEventListener("change", (e) => {
        const pageNum = parseInt(e.target.value);
        if (pageNum > 0 && pageNum <= this.totalPages) {
          this.currentPage = pageNum;
          this.renderPage();
        } else {
          this.pageInput.value = this.currentPage;
        }
      });
    }

    if (this.prevPageBtn) {
      this.prevPageBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.pageInput.value = this.currentPage;
          this.renderPage();
        }
      });
    }

    if (this.nextPageBtn) {
      this.nextPageBtn.addEventListener("click", () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.pageInput.value = this.currentPage;
          this.renderPage();
        }
      });
    }

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => this.downloadResume());
    }

    // Close modal on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal?.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  async openModal() {
    if (!this.modal) return;

    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Load PDF if not already loaded
    if (!this.pdfDoc) {
      await this.loadPDF();
    }
  }

  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  async loadPDF() {
    if (!this.loader) return;

    try {
      this.loader.classList.add("active");

      // Load PDF from assets folder
      const response = await fetch("assets/resume.pdf");

      if (!response.ok) {
        throw new Error(
          "Failed to load resume.pdf. Make sure it exists in assets/resume.pdf",
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      if (typeof pdfjsLib === "undefined") {
        throw new Error("PDF.js library not loaded. Check CDN link.");
      }

      this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.totalPages = this.pdfDoc.numPages;

      if (this.totalPagesSpan) {
        this.totalPagesSpan.textContent = this.totalPages;
      }

      if (this.pageInput) {
        this.pageInput.max = this.totalPages;
        this.pageInput.value = 1;
      }

      // Render first page
      await this.renderPage();
    } catch (error) {
      console.error("Error loading PDF:", error);
      if (this.canvas) {
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.fillRect(0, 0, 400, 600);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Error loading PDF", 200, 300);
        this.ctx.fillText(`${error.message}`, 200, 330);
      }
    } finally {
      if (this.loader) {
        this.loader.classList.remove("active");
      }
    }
  }

  async renderPage() {
    if (!this.pdfDoc || this.isRendering) return;

    this.isRendering = true;

    try {
      const page = await this.pdfDoc.getPage(this.currentPage);

      // Set canvas dimensions based on PDF page
      const scale = 2; // Higher scale = better quality
      const viewport = page.getViewport({ scale });

      if (this.canvas) {
        this.canvas.width = viewport.width;
        this.canvas.height = viewport.height;

        const renderContext = {
          canvasContext: this.ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      }

      // Update navigation buttons
      this.updateNavButtons();
    } catch (error) {
      console.error("Error rendering page:", error);
    } finally {
      this.isRendering = false;
    }
  }

  updateNavButtons() {
    if (this.prevPageBtn) {
      this.prevPageBtn.disabled = this.currentPage === 1;
    }
    if (this.nextPageBtn) {
      this.nextPageBtn.disabled = this.currentPage === this.totalPages;
    }
  }

  downloadResume() {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = "assets/resume.pdf";
    link.download = "Shaik_Mujeeb_Software-Dev_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if resume modal exists
  if (document.getElementById("resumeModal")) {
    window.resumeViewer = new ResumeViewer();
  }
});
