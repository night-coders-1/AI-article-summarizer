document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key");
  const saveButton = document.getElementById("save-button");
  const successMessage = document.getElementById("success-message");

  // Add focus animation to input
  apiKeyInput.addEventListener("focus", () => {
    apiKeyInput.parentElement.style.boxShadow =
      "0 0 0 3px rgba(99, 102, 241, 0.1)";
  });

  apiKeyInput.addEventListener("blur", () => {
    apiKeyInput.parentElement.style.boxShadow = "";
  });

  // Load saved API key if it exists
  chrome.storage.sync.get(["geminiApiKey"], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
      // Show a subtle animation to indicate the key is loaded
      apiKeyInput.classList.add("loaded");
    }
  });

  // Save API key when button is clicked
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();

    // Add loading state to button
    const originalButtonContent = saveButton.innerHTML;
    saveButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
    saveButton.disabled = true;

    if (apiKey) {
      // Validate API key format (basic check for length)
      if (apiKey.length < 10) {
        // Show error for invalid API key format
        saveButton.innerHTML =
          '<i class="fas fa-exclamation-circle"></i><span>Invalid API Key</span>';
        saveButton.style.backgroundColor = "#ef4444";

        // Shake the input field to indicate error
        apiKeyInput.classList.add("shake");
        setTimeout(() => {
          apiKeyInput.classList.remove("shake");
        }, 500);

        // Reset button after delay
        setTimeout(() => {
          saveButton.innerHTML = originalButtonContent;
          saveButton.style.backgroundColor = "";
          saveButton.disabled = false;
        }, 2000);
        return;
      }

      // Use chrome.storage.sync.set with proper error handling
      chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving API key:", chrome.runtime.lastError);
          saveButton.innerHTML =
            '<i class="fas fa-exclamation-circle"></i><span>Error Saving</span>';
          saveButton.style.backgroundColor = "#ef4444";

          setTimeout(() => {
            saveButton.innerHTML = originalButtonContent;
            saveButton.style.backgroundColor = "";
            saveButton.disabled = false;
          }, 2000);
          return;
        }

        // Show success message with animation
        successMessage.style.display = "flex";

        // Reset button state
        setTimeout(() => {
          saveButton.innerHTML =
            '<i class="fas fa-check save-success"></i><span>Saved!</span>';
          saveButton.disabled = false;

          // Test the API key with a simple request
          testApiKey(apiKey);

          // Don't close the tab automatically, just show success message
          setTimeout(() => {
            saveButton.innerHTML = originalButtonContent;
          }, 2000);
        }, 500);
      });
    } else {
      // Show error state if no API key
      saveButton.innerHTML =
        '<i class="fas fa-exclamation-circle"></i><span>API Key Required</span>';
      saveButton.style.backgroundColor = "#ef4444";

      // Shake the input field to indicate error
      apiKeyInput.classList.add("shake");
      setTimeout(() => {
        apiKeyInput.classList.remove("shake");
      }, 500);

      // Reset button after delay
      setTimeout(() => {
        saveButton.innerHTML = originalButtonContent;
        saveButton.style.backgroundColor = "";
        saveButton.disabled = false;
      }, 2000);
    }
  });

  // Add keypress event to save on Enter
  apiKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveButton.click();
    }
  });
});

// Function to test the API key with a simple request
async function testApiKey(apiKey) {
  try {
    // Create a status element if it doesn't exist
    let statusElement = document.getElementById("api-key-status");
    if (!statusElement) {
      statusElement = document.createElement("div");
      statusElement.id = "api-key-status";
      statusElement.style.marginTop = "var(--space-3)";
      statusElement.style.fontSize = "14px";
      document.querySelector(".form-group").appendChild(statusElement);
    }

    // Show testing status
    statusElement.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Testing API key...';
    statusElement.style.color = "var(--text-secondary)";

    // Make a simple request to the Gemini API
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello, please respond with 'API key is working correctly.'",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    // API key is working
    statusElement.innerHTML =
      '<i class="fas fa-check-circle" style="color: var(--secondary-color);"></i> API key is valid and working';
    statusElement.style.color = "var(--secondary-color)";

    // Hide the status after 5 seconds
    setTimeout(() => {
      statusElement.style.opacity = "0";
      statusElement.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        statusElement.remove();
      }, 500);
    }, 5000);
  } catch (error) {
    console.error("Error testing API key:", error);

    // Show error message
    const statusElement = document.getElementById("api-key-status");
    if (statusElement) {
      statusElement.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> ${
        error.message || "API key validation failed"
      }`;
      statusElement.style.color = "#ef4444";
    }
  }
}

// Add these styles dynamically
const style = document.createElement("style");
style.textContent = `
  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }

  .loaded {
    animation: fadeIn 0.5s ease-in-out;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
    40%, 60% { transform: translate3d(3px, 0, 0); }
  }

  #api-key-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
  }
`;
document.head.appendChild(style);
