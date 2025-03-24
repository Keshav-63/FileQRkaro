document.addEventListener("DOMContentLoaded", () => {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add("dark");
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Add animation effect
    document.documentElement.style.transition =
      "background-color 0.5s ease, color 0.5s ease";
    setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 500);
  });
});
