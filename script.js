document.addEventListener("DOMContentLoaded", () => {
  
  // --- CUSTOM CURSOR LOGIC ---
  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");
  
  // Update cursor position on mouse move
  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    // The dot follows instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    // The outline follows with a slight smooth CSS transition
    cursorOutline.style.left = `${posX}px`;
    cursorOutline.style.top = `${posY}px`;
  });

  // Add hover effect when hovering over interactive elements
  const interactiveElements = document.querySelectorAll("a, button, .project-card, .close-btn");
  
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorOutline.classList.add("cursor-hover");
    });
    
    el.addEventListener("mouseleave", () => {
      cursorOutline.classList.remove("cursor-hover");
    });
  });


  // --- MODAL LOGIC ---
  const projectCards = document.querySelectorAll(".project-card");
  const closeButtons = document.querySelectorAll(".close-btn");
  const modals = document.querySelectorAll(".project-overlay");

  // Open corresponding modal
  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const targetModalId = card.getAttribute("data-target");
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        targetModal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
      }
    });
  });

  // Close modals via close button
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const activeModal = e.target.closest(".project-overlay");
      if (activeModal) {
        activeModal.classList.remove("active");
        document.body.style.overflow = "auto"; // Restore scrolling
      }
    });
  });

  // Close modals when clicking completely outside the modal content window
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });
  });
});
