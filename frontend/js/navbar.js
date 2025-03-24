document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");

      // Toggle between menu and close icons
      const menuIcon = mobileMenuToggle.querySelector(".menu-icon");
      const closeIcon = mobileMenuToggle.querySelector(".close-icon");

      if (menuIcon && closeIcon) {
        if (mobileMenu.classList.contains("active")) {
          menuIcon.style.display = "none";
          closeIcon.style.display = "block";
        } else {
          menuIcon.style.display = "block";
          closeIcon.style.display = "none";
        }
      }
    });
  }

  // User dropdown menu
  const userMenuBtn = document.querySelector(".user-menu-btn");
  const userDropdown = document.querySelector(".user-dropdown");

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      if (userDropdown.classList.contains("active")) {
        userDropdown.classList.remove("active");
      }
    });

    // Prevent dropdown from closing when clicking inside it
    userDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  };

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", handleLogout);
  }
});
