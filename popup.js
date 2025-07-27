// Add summarize button functionality
document.addEventListener("DOMContentLoaded", () => {
  const summarizeBtn = document.getElementById("summarize");

  if (summarizeBtn) {
    summarizeBtn.addEventListener("click", async () => {
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML =
        '<div class="loading"><div class="loader"></div><div class="loading-text"><span class="loading-dots">generating</span></div></div>';

      const summaryType = document.getElementById("summary-type").value;

      // Get API key from storage
      chrome.storage.sync.get(["geminiApiKey"], async (result) => {
        if (!result.geminiApiKey) {
          resultDiv.innerHTML =
            "API key not found. Please set your API key in the extension options.";
          return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "GET_ARTICLE_TEXT" },
            async (res) => {
              if (!res || !res.text) {
                resultDiv.innerText =
                  "Could not extract article text from this page.";
                return;
              }

              try {
                const summary = await getGeminiSummary(
                  res.text,
                  summaryType,
                  result.geminiApiKey
                );
                resultDiv.innerHTML = summary;
              } catch (error) {
                resultDiv.innerText = `Error: ${
                  error.message || "Failed to generate summary."
                }`;
              }
            }
          );
        });
      });
    });
  } else {
    console.error("Summarize button not found in the DOM");
  }
});

// Add copy button functionality
document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("quick-copy-btn");

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      // Get the text content without HTML tags for clipboard
      const resultElement = document.getElementById("result");
      const summaryText = resultElement.textContent || resultElement.innerText;

      if (summaryText && summaryText.trim() !== "") {
        navigator.clipboard
          .writeText(summaryText)
          .then(() => {
            const originalIcon = copyBtn.innerHTML;

            // Show success animation
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.classList.add("success-pulse");

            setTimeout(() => {
              copyBtn.innerHTML = originalIcon;
              copyBtn.classList.remove("success-pulse");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      }
    });
  } else {
    console.error("Copy button not found in the DOM");
  }
});

// Add refresh button functionality
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-btn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      const resultDiv = document.getElementById("result");

      // Show loading animation
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt spin"></i>';
      resultDiv.innerHTML =
        '<div class="loading"><div class="loader"></div><div class="loading-text"><span class="loading-dots">generating</span></div></div>';

      const summaryType = document.getElementById("summary-type").value;

      // Get API key from storage
      chrome.storage.sync.get(["geminiApiKey"], async (result) => {
        if (!result.geminiApiKey) {
          resultDiv.innerHTML =
            "API key not found. Please set your API key in the extension options.";
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
          return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "GET_ARTICLE_TEXT" },
            async (res) => {
              if (!res || !res.text) {
                resultDiv.innerText =
                  "Could not extract article text from this page.";
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                return;
              }

              try {
                const summary = await getGeminiSummary(
                  res.text,
                  summaryType,
                  result.geminiApiKey
                );
                resultDiv.innerHTML = summary;
              } catch (error) {
                resultDiv.innerText = `Error: ${
                  error.message || "Failed to generate summary."
                }`;
              } finally {
                // Restore original icon
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
              }
            }
          );
        });
      });
    });
  } else {
    console.error("Refresh button not found in the DOM");
  }
});

// Function to highlight important key points in the summary
function highlightKeyPoints(text) {
  if (!text) return text;

  // First, properly format bullet points for better styling
  text = text.replace(/^- (.+)$/gm, "<li>$1</li>");

  // If we have bullet points, wrap them in a ul
  if (text.includes("<li>")) {
    text = text.replace(/(<li>.+<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  }

  // Patterns to match important information
  const patterns = [
    // Numbers with currency symbols or percentage
    /\$\d+(?:[.,]\d+)*(?:\s*(?:million|billion|trillion))?/g, // Currency with $ (e.g. $10.5 million)
    /\d+(?:[.,]\d+)*\s*%/g, // Percentages (e.g. 15.7%)
    /(?:€|£|¥|₹|₽|₩|₺|₴|₦|₱|₲|₡|₫|฿|₭|₸|₼|₾|₺)\d+(?:[.,]\d+)*(?:\s*(?:million|billion|trillion))?/g, // Other currencies

    // Years and dates
    /\b(?:19|20)\d{2}\b/g, // Years like 1999, 2023
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s+\d{4})?\b/gi, // Month day, year
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:,\s+\d{4})?\b/gi, // Day month, year
    /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/g, // Dates like MM/DD/YYYY or DD-MM-YYYY

    // Time periods
    /\b(?:decade|century|millennium)\b/gi, // Time periods
    /\b(?:\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:day|week|month|year|decade|century)s?\b/gi, // Time durations

    // Large numbers that might represent significant values
    /\b\d{4,}\b/g, // Numbers with 4+ digits (more inclusive than before)
    /\b\d+(?:[.,]\d+)*\s*(?:million|billion|trillion|thousand|hundred)\b/gi, // Numbers with scale

    // Counts and quantities
    /\b(?:over|under|about|approximately|around|nearly|almost|exactly|precisely)\s+\d+(?:[.,]\d+)*\b/gi, // Approximate counts
    /\b\d+(?:[.,]\d+)*\s+(?:people|users|customers|employees|workers|students|patients|participants|members|subscribers|followers|viewers|visitors|residents)\b/gi, // People counts

    // Milestone terms with numbers
    /\b(?:increase|decrease|growth|decline|rise|fall|jump|drop|surge|plunge|spike|dip|soar|plummet|climb|sink)\s+(?:of|by|to)?\s+\d+(?:[.,]\d+)*\s*%?/gi,
    /\b\d+(?:[.,]\d+)*\s*%?\s+(?:increase|decrease|growth|decline|rise|fall|jump|drop|surge|plunge|spike|dip|soar|plummet|climb|sink)\b/gi,

    // Ratios, rankings and comparisons
    /\b(?:ratio|proportion|rate|ranking|position|standing|rating|score|grade|level|tier|class|category|rank)\s+(?:of|at|as)?\s+\d+(?:[.,]\d+)*\s*%?/gi,
    /\b(?:top|bottom|first|last|\d+(?:st|nd|rd|th))\s+(?:place|position|rank|spot|tier)\b/gi, // Rankings

    // Key milestone terms
    /\b(?:milestone|achievement|record|breakthrough|launch|release|unveil|introduce|announce|discovery|innovation|advancement|improvement|enhancement|upgrade|revolution|transformation|disruption|paradigm shift)\b/gi,

    // Important metrics and KPIs
    /\b(?:revenue|profit|loss|sales|income|earnings|margin|ROI|ROE|ROAS|CAC|LTV|ARPU|EBITDA|EPS)\b/gi, // Business metrics
    /\b(?:market share|user base|customer base|audience|reach|engagement|retention|churn|conversion|bounce rate)\b/gi, // Market metrics

    // Specific number formats
    /\b\d+(?:[.,]\d+)*\s*(?:x|times)\b/gi, // Multipliers like 2x or 10 times
    /\b(?:version|v)\s*\d+(?:\.\d+)*(?:-[a-zA-Z0-9]+)?\b/gi, // Version numbers like v2.0.1 or version 3.5-beta
  ];

  try {
    // Advanced method using DOM manipulation for better merging of adjacent highlights
    // Create a temporary container to work with the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    // Function to process text nodes and apply highlighting
    function processTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        let content = node.textContent;
        let highlighted = false;

        // Apply all patterns to this text node
        patterns.forEach((pattern) => {
          if (pattern.test(content)) {
            highlighted = true;
            content = content.replace(
              pattern,
              (match) => `<span class="highlight">${match}</span>`
            );
          }
        });

        // If we made changes, replace the text node with the highlighted HTML
        if (highlighted) {
          const tempNode = document.createElement("span");
          tempNode.innerHTML = content;
          node.parentNode.replaceChild(tempNode, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip existing highlight spans to avoid double-processing
        if (node.classList && node.classList.contains("highlight")) {
          return;
        }

        // Process child nodes
        Array.from(node.childNodes).forEach((child) => {
          processTextNodes(child);
        });
      }
    }

    // Process all text nodes in the container
    Array.from(tempDiv.childNodes).forEach((node) => {
      processTextNodes(node);
    });

    // Merge adjacent highlight spans
    function mergeHighlights(container) {
      const highlights = container.querySelectorAll(".highlight");
      for (let i = 0; i < highlights.length - 1; i++) {
        const current = highlights[i];
        const next = highlights[i + 1];

        // Check if they're adjacent (only whitespace between them)
        if (
          current.nextSibling &&
          current.nextSibling.nodeType === Node.TEXT_NODE &&
          current.nextSibling.textContent.trim() === "" &&
          current.nextSibling.nextSibling === next
        ) {
          // Merge the highlights
          current.innerHTML += current.nextSibling.textContent + next.innerHTML;
          next.parentNode.removeChild(next);
          current.parentNode.removeChild(current.nextSibling);

          // Rerun the merge function since we modified the DOM
          mergeHighlights(container);
          break;
        }
      }
    }

    // Merge adjacent highlights
    mergeHighlights(tempDiv);

    return tempDiv.innerHTML;
  } catch (error) {
    console.error(
      "Error in advanced highlighting, falling back to simple method:",
      error
    );

    // Fallback to simpler method if DOM manipulation fails
    // Apply highlighting to matches
    patterns.forEach((pattern) => {
      text = text.replace(
        pattern,
        (match) => `<span class="highlight">${match}</span>`
      );
    });

    // Simple method to merge consecutive highlighted spans
    // This will merge spans that are directly adjacent with no whitespace
    text = text.replace(/(<\/span>)(<span class="highlight">)/g, "");

    // This will merge spans with whitespace between them
    text = text.replace(/(<\/span>)\s+(<span class="highlight">)/g, " ");

    return text;
  }
}

async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncate very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `Summarize the following article in 5-7 key points. Format each point as a line starting with "- " (dash followed by a space). Do not use asterisks or other bullet symbols, only use the dash. Keep each point concise and focused on a single key insight from the article.

IMPORTANT: Include ALL relevant numbers, statistics, dates, years, percentages, currency values, metrics, rankings, time periods, version numbers, and milestone achievements. If there are specific counts, measurements, or quantifiable data in the article, make sure to include them in your summary. These data points are crucial for understanding the article's significance.\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await res.json();
    let summaryText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary available.";

    // Highlight important key points like numbers, revenues, milestones
    summaryText = highlightKeyPoints(summaryText);

    return summaryText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}
