// Main function to extract article text with improved detection
function getArticleText() {
  // 1. Look for article tag
  const article = document.querySelector("article");
  if (article) return article.innerText;

  // 2. Look for main content areas
  const mainContent = document.querySelector(
    ".content, .post-content, .entry-content, .article-content, .page-content"
  );
  if (mainContent) return mainContent.innerText;

  // 3. Look for divs with article-like classes
  const articleDiv = document.querySelector(
    "div[class*='article'], div[class*='post'], div[class*='content']"
  );
  if (articleDiv) return articleDiv.innerText;

  // 4. Look for main tag
  const main = document.querySelector("main");
  if (main) return main.innerText;

  // 5. Fallback to paragraphs
  const paragraphs = Array.from(document.querySelectorAll("p"));
  if (paragraphs.length > 3) {
    // Only use if we have a reasonable number of paragraphs
    return paragraphs.map((p) => p.innerText).join("\n\n");
  }

  // 6. Last resort - try to get text from the body, excluding scripts, styles, etc.
  return Array.from(document.body.querySelectorAll("*"))
    .filter((el) => {
      const tag = el.tagName.toLowerCase();
      return ![
        "script",
        "style",
        "svg",
        "nav",
        "footer",
        "header",
        "aside",
      ].includes(tag);
    })
    .map((el) => el.innerText)
    .filter((text) => text.trim().length > 100) // Only include elements with substantial text
    .join("\n\n");
}

// Show a subtle visual feedback when extraction is happening
function showExtractionFeedback() {
  // Create a floating indicator
  const indicator = document.createElement("div");
  indicator.id = "ai-summary-pro-indicator";
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(99, 102, 241, 0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #6366f1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;

  // Add a subtle animation
  indicator.innerHTML = `
    <div style="display: flex; align-items: center;">
      <div style="
        width: 16px;
        height: 16px;
        border: 2px solid rgba(99, 102, 241, 0.3);
        border-top: 2px solid rgba(99, 102, 241, 1);
        border-radius: 50%;
        margin-right: 10px;
        animation: ai-summary-spin 1s linear infinite;
      "></div>
      <span>AI Summary Pro extracting content...</span>
    </div>
    <style>
      @keyframes ai-summary-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Add to page and animate in
  document.body.appendChild(indicator);
  setTimeout(() => {
    indicator.style.opacity = "1";
    indicator.style.transform = "translateY(0)";
  }, 10);

  // Return a function to remove the indicator
  return () => {
    indicator.style.opacity = "0";
    indicator.style.transform = "translateY(-10px)";
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    // Show extraction feedback
    const removeIndicator = showExtractionFeedback();

    // Extract text with a slight delay to allow the indicator to show
    setTimeout(() => {
      const text = getArticleText();
      sendResponse({ text });

      // Remove the indicator after a short delay
      setTimeout(removeIndicator, 500);
    }, 300);

    // Return true to indicate we'll respond asynchronously
    return true;
  }
});
