document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");


  if (successMessage) {
    successMessage.style.display = "none";
  }

  // Form validation
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearError(inputId) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }


  if (contactForm) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");

    // Clear errors on input
    nameInput.addEventListener("input", () => {
      clearError("name");
    });

    emailInput.addEventListener("input", () => {
      clearError("email");
    });

    subjectInput.addEventListener("input", () => {
      clearError("subject");
    });

    messageInput.addEventListener("input", () => {
      clearError("message");
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;

     
      if (!nameInput.value.trim()) {
        showError("name", "Name is required");
        isValid = false;
      }

     
      if (!emailInput.value.trim()) {
        showError("email", "Email is required");
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        showError("email", "Please enter a valid email");
        isValid = false;
      }

     
      if (!subjectInput.value.trim()) {
        showError("subject", "Subject is required");
        isValid = false;
      }

      
      if (!messageInput.value.trim()) {
        showError("message", "Message is required");
        isValid = false;
      }

      if (isValid) {
       
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;

      
        const formData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim(),
        };

        try {
          
          const response = await fetch("https://fileqrkaro.onrender.com/submit-contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error("Failed to submit contact form");
          }

          const result = await response.json();
          console.log(result.message);

          
          contactForm.style.display = "none";
          successMessage.style.display = "flex";

          
          contactForm.reset();

          
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;

          
          setTimeout(() => {
            successMessage.style.display = "none";
            contactForm.style.display = "block";
          }, 5000);
        } catch (error) {
          alert("Error: " + error.message);
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;
        }
      }
    });
  }
});
