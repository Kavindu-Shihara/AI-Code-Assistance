/**========================================
 * CodeX AI Assistant - Main Script
 * Purpose: Handles all UI interactions and AI API calls
 * Dependencies: CodeMirror, Font Awesome, OpenRouter API
========================================**/

// ===== CODE EDITOR INITIALIZATION =====
// Initialize CodeMirror: Advanced code editor with syntax highlighting
let editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineNumbers: true,              // Show line numbers on left side
  theme: "dracula",              // Apply Dracula dark theme
  mode: "javascript",            // Default language mode (JavaScript)
  tabSize: 2,                     // Use 2 spaces for indentation
  indentWithTabs: true,           // Allow tab key for indentation
  autoCloseBrackets: true,        // Auto-close brackets: {}, [], ()
  matchBrackets: true,            // Highlight matching brackets
  styleActiveLine: true,          // Highlight current line
  lineWrapping: true,             // Wrap long lines
  placeholder: "// Write your code here...",
});

// ===== DOM ELEMENTS REFERENCES =====
// Control buttons and dropdowns
const languageSelect = document.getElementById("language");      // Language selector dropdown
const checkCodeBtn = document.getElementById("checkCode");       // Analyze code button
const formatCodeBtn = document.getElementById("formatCode");     // Format code button
const clearCodeBtn = document.getElementById("clearCode");       // Clear editor button

// Output/Response elements
const output = document.getElementById("output");                // Analysis results area
const fixSection = document.getElementById("fixSection");        // Corrected code area
const copyOutputBtn = document.getElementById("copyOutput");     // Copy analysis button
const copyAnswerBtn = document.getElementById("copyAnswer");     // Copy corrected code button
const analysisStatus = document.getElementById("analysisStatus"); // Analysis status indicator
const answerStatus = document.getElementById("answerStatus");     // Answer status indicator

// API Configuration elements
const apiKeyInput = document.getElementById("apiKey");           // API key input field
const saveApiBtn = document.getElementById("saveApiBtn");         // Save API button
const clearApiBtn = document.getElementById("clearApiBtn");       // Clear API button
const apiStatus = document.getElementById("apiStatus");           // API status message area

// ===== API KEY MANAGEMENT =====
// Retrieve stored API key from browser storage (localStorage) on page load
let savedApiKey = localStorage.getItem("openrouterApiKey") || "";
// If API key exists, load it into input field and show status
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
  showApiStatus("API Loaded", false);
}

// ===== API MANAGEMENT FUNCTIONS =====
/**
 * Display temporary status message for API operations
 * @param {string} message - Status message to display
 * @param {boolean} isError - If true, shows error styling (red color)
 */
function showApiStatus(message, isError = false) {
  apiStatus.textContent = message;                     // Set status text
  apiStatus.classList.add("saved");                   // Make status visible
  
  // Apply error styling if this is an error message
  if (isError) {
    apiStatus.classList.add("error");                 // Add red error styling
  } else {
    apiStatus.classList.remove("error");              // Remove error styling
  }
  
  // Auto-hide status message after 3 seconds
  setTimeout(() => {
    apiStatus.classList.remove("saved");              // Hide status
  }, 3000);
}

// ===== SAVE API KEY BUTTON EVENT =====
// Triggered when user clicks "Save API" button
saveApiBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();             // Get API key and remove whitespace
  
  // Validation: ensure API key is not empty
  if (!apiKey) {
    showApiStatus("Please enter an API key", true);   // Show error message
    return;                                             // Exit function
  }
  
  // Save API key to browser's localStorage (persists across sessions)
  localStorage.setItem("openrouterApiKey", apiKey);
  savedApiKey = apiKey;                               // Update in-memory variable
  showApiStatus("✓ API Saved", false);                // Show success message
});

// ===== CLEAR API KEY BUTTON EVENT =====
// Triggered when user clicks "Clear" button
clearApiBtn.addEventListener("click", () => {
  apiKeyInput.value = "";                             // Clear input field
  localStorage.removeItem("openrouterApiKey");        // Remove from storage
  savedApiKey = "";                                   // Clear in-memory variable
  showApiStatus("API Cleared", false);                // Show confirmation message
});

// ===== LANGUAGE CONFIGURATION =====
// Map language names to CodeMirror editor modes for syntax highlighting
const languageModes = {
  javascript: "javascript",        // JavaScript syntax highlighting
  python: "python",                // Python syntax highlighting
  cpp: "text/x-c++src",           // C++ syntax highlighting
  java: "text/x-java",            // Java syntax highlighting
  html: "xml",                     // HTML (uses XML syntax mode)
  css: "css",                      // CSS syntax highlighting
};

// ===== EXAMPLE CODE TEMPLATES =====
// Provides starter code for each supported language
const exampleCodes = {
  // JavaScript example: Function that prints greeting
  javascript: `// Example JavaScript code
function greet(name) {
  console.log("Hello, " + name);
}
greet("CodeX");`,

  // Python example: Function that prints greeting
  python: `# Example Python code
def greet(name):
    print("Hello, " + name)
greet("CodeX")`,

  // C++ example: Simple Hello World program
  cpp: `// Example C++ code
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, CodeX!" << endl;
    return 0;
}`,

  // Java example: Simple Hello World program
  java: `// Example Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeX!");
    }
}`,

  // HTML example: Basic HTML structure
  html: `<!-- Example HTML code -->
<!DOCTYPE html>
<html>
  <head><title>CodeX Example</title></head>
  <body>
    <h1>Hello, CodeX!</h1>
  </body>
</html>`,

  // CSS example: Basic styling
  css: `/* Example CSS code */
body {
  background-color: #282a36;
  color: #f8f8f2;
  font-family: 'JetBrains Mono', monospace;
}`,
};

// ===== LANGUAGE SWITCHING FUNCTION =====
/**
 * Switch editor mode and load example code for selected language
 * @param {string} lang - Language code (javascript, python, cpp, java, html, css)
 */
function showExample(lang) {
  // Set the CodeMirror mode for syntax highlighting
  editor.setOption("mode", languageModes[lang]);
  
  // Clear all current content and reset UI
  editor.setValue("");                                  // Clear editor
  output.textContent = "📝 Editor cleared. Ready for new code."; // Reset analysis area
  fixSection.innerHTML = "";                           // Clear corrected code area
  copyOutputBtn.style.display = "none";                // Hide copy button
  copyAnswerBtn.style.display = "none";                // Hide copy button
  analysisStatus.textContent = "";                     // Clear status
  answerStatus.textContent = "";                       // Clear status

  // Load and display example code for the selected language
  const example = exampleCodes[lang];
  editor.setValue(example);

  // Listen for first user edit and remove example code when editing starts
  editor.on("beforeChange", function handler(cm, change) {
    if (change.origin !== "setValue") {                // Check if user is editing (not programmatic change)
      editor.off("beforeChange", handler);             // Stop listening after first edit
      editor.setValue(change.text.join("\n"));         // Keep user's input
    }
  });
}

// ===== LANGUAGE DROPDOWN CHANGE EVENT =====
// Triggered when user selects a different programming language
languageSelect.addEventListener("change", () => {
  // Ask user for confirmation before clearing the editor
  const confirmChange = confirm(
    "⚠️ Changing the language will clear the editor. Continue?",
  );
  
  // If user confirms, switch language and load example
  if (confirmChange) {
    showExample(languageSelect.value);
  } else {
    // If user cancels, revert dropdown to current language
    languageSelect.value = Object.keys(languageModes).find(
      (key) => languageModes[key] === editor.getOption("mode"),
    );
  }
});

// ===== CLEAR CODE BUTTON EVENT =====
// Triggered when user clicks "Clear" button to reset editor
clearCodeBtn.addEventListener("click", () => {
  editor.setValue("");                                // Clear all code from editor
  output.textContent = "Editor cleared.";             // Update analysis area
  fixSection.innerHTML = "";                         // Clear corrected code area
  copyOutputBtn.style.display = "none";               // Hide copy button
  copyAnswerBtn.style.display = "none";               // Hide copy button
  analysisStatus.textContent = "";                    // Clear status indicators
  answerStatus.textContent = "";
});

// ===== COPY TO CLIPBOARD FUNCTIONALITY =====
/**
 * Copy text to clipboard and show temporary confirmation
 * @param {string} text - Text to copy to clipboard
 * @param {HTMLElement} button - Button element that triggered copy
 */
function copyToClipboard(text, button) {
  // Use modern Clipboard API to copy text
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Success: Show "Copied!" confirmation for 2 seconds
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      button.classList.add("copied");  // Apply copied styling

      // Revert button text after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove("copied");
      }, 2000);
    })
    .catch(() => {
      // Error: Show alert if copy fails
      alert("Failed to copy text");
    });
}

// ===== COPY ANALYSIS BUTTON EVENT =====
// Triggered when user clicks copy button for analysis results
copyOutputBtn.addEventListener("click", () => {
  copyToClipboard(output.textContent, copyOutputBtn);
});

// ===== COPY CORRECTED CODE BUTTON EVENT =====
// Triggered when user clicks copy button for improved code
copyAnswerBtn.addEventListener("click", () => {
  const answerText = fixSection.textContent;
  copyToClipboard(answerText, copyAnswerBtn);
});

// ===== FORMAT CODE BUTTON EVENT =====
// Triggered when user clicks "Format" button to clean up code formatting
formatCodeBtn.addEventListener("click", () => {
  try {
    // Get code from editor
    let formatted = editor.getValue();
    
    // Remove extra spaces from each line
    formatted = formatted
      .split("\n")                         // Split into individual lines
      .map((line) => line.trim())          // Remove leading/trailing spaces
      .join("\n");                         // Rejoin into single string
    
    // Update editor with formatted code
    editor.setValue(formatted);
    
    // Show success message
    output.textContent = "✨ Code formatted successfully!";
    fixSection.innerHTML = "";
    copyOutputBtn.style.display = "none";
    copyAnswerBtn.style.display = "none";
  } catch (err) {
    // Show error if formatting fails
    output.textContent = "❌ Error formatting code: " + err;
  }
});

// ===== ANALYZE CODE BUTTON EVENT =====
// Triggered when user clicks "Analyze" button - Main AI analysis function
checkCodeBtn.addEventListener("click", async () => {
  // Reset UI and show loading state
  output.textContent = "🔍 Analyzing code...";
  fixSection.innerHTML = "⏳ Processing...";
  copyOutputBtn.style.display = "none";               // Hide copy buttons
  copyAnswerBtn.style.display = "none";
  analysisStatus.textContent = "";
  answerStatus.textContent = "";

  // Get code and language from UI
  const code = editor.getValue();                      // Get code from editor
  const lang = languageSelect.value;                   // Get selected language

  // Validation: ensure code is not empty
  if (!code.trim()) {
    output.textContent = "⚠️ Please write some code first!";
    fixSection.innerHTML = "";
    return;                                            // Exit if no code
  }

  try {
    // ===== API KEY VALIDATION =====
    // Check if API key is configured before making request
    if (!savedApiKey) {
      output.textContent = "⚠️ Please add your API key first!";
      fixSection.innerHTML =
        "Configure your API key in the API Key section above.";
      return;                                          // Exit if no API key
    }
    
    // ===== SEND REQUEST TO OPENROUTER API =====
    // Make POST request to OpenRouter's chat completion endpoint
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",  // OpenRouter API endpoint
      {
        method: "POST",                                 // Send POST request
        headers: {
          "Content-Type": "application/json",         // Request body is JSON
          Authorization: `Bearer ${savedApiKey}`,      // Include API key for authentication
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",       // AI model to use
          messages: [
            {
              // System prompt: Instructs AI how to analyze code
              role: "system",
              content:
                "You are an expert coding assistant. Analyze the code and provide: 1) ANALYSIS section with issues, bugs, and suggestions 2) CORRECT ANSWER section with improved/fixed code with explanation. Format your response clearly with these two sections separated.",
            },
            {
              // User message: Contains the code to analyze
              role: "user",
              content: `Language: ${lang}\n\nPlease analyze this code and provide the correct solution:\n\n${code}`,
            },
          ],
          temperature: 0.3,                            // Lower temperature = more focused responses
        }),
      },
    );

    // ===== PARSE API RESPONSE =====
    // Convert response from JSON format
    const data = await response.json();

    // Check if API returned valid response with choices
    if (data.choices && data.choices.length > 0) {
      // Extract AI's analysis and suggestions
      const aiMessage = data.choices[0].message.content;

      // Parse response to separate analysis from corrected code
      const parts = parseAIResponse(aiMessage);

      // ===== DISPLAY ANALYSIS RESULTS =====
      // Show the code analysis and feedback
      output.textContent = parts.analysis || "✅ Code analysis complete";
      analysisStatus.textContent = "✓ Ready";         // Mark as ready
      copyOutputBtn.style.display = "inline-flex";    // Show copy button

      // ===== DISPLAY CORRECTED CODE =====
      // Show improved/fixed version if available
      if (parts.correctAnswer) {
        // Display corrected code in green with proper formatting
        fixSection.innerHTML = `<pre style="color: #50fa7b; white-space: pre-wrap; word-break: break-word;">${escapeHtml(parts.correctAnswer)}</pre>`;
        answerStatus.textContent = "✓ Ready";         // Mark as ready
        copyAnswerBtn.style.display = "inline-flex";  // Show copy button
      } else {
        // No errors found - code is valid
        fixSection.innerHTML = "✅ Code looks good!";
        answerStatus.textContent = "✓ Valid";
      }
    } else {
      // API returned an error
      output.textContent =
        "⚠️ API Error: " + (data.error?.message || "Unknown error");
      fixSection.innerHTML = "";
    }
  } catch (err) {
    // ===== ERROR HANDLING =====
    // Display connection error if API call fails
    output.textContent = "❌ Connection Error: " + err.message;
    fixSection.innerHTML = "Please check your API key and try again.";
  }
});

// ===== PARSE AI RESPONSE FUNCTION =====
/**
 * Extract analysis and corrected code from AI response
 * Separates the response into two main sections
 * @param {string} text - Full AI response text
 * @returns {object} Object with 'analysis' and 'correctAnswer' properties
 */
function parseAIResponse(text) {
  // Initialize result object with empty sections
  const parts = { analysis: "", correctAnswer: "" };

  // ===== EXTRACT ANALYSIS SECTION =====
  // Look for "ANALYSIS" heading and extract text until "CORRECT ANSWER" or end
  const analysisMatch = text.match(/ANALYSIS[\s\S]*?(?=CORRECT ANSWER|$)/i);
  // Extract corrected code section
  const answerMatch = text.match(/CORRECT ANSWER[\s\S]*?(?=$)/i);

  // ===== PARSE ANALYSIS =====
  // Remove "ANALYSIS" header and trim whitespace
  if (analysisMatch) {
    parts.analysis = analysisMatch[0].replace(/^ANALYSIS\s*:?\s*/i, "").trim();
  }

  // ===== PARSE CORRECTED CODE =====
  if (answerMatch) {
    let answer = answerMatch[0].replace(/^CORRECT ANSWER\s*:?\s*/i, "").trim();
    
    // Try to extract code from markdown code blocks (```code```)
    const codeMatch = answer.match(/```[\w]*\n([\s\S]*?)\n```/);
    parts.correctAnswer = codeMatch ? codeMatch[1] : answer;  // Use extracted code or full text
  }

  // ===== FALLBACK =====
  // If no structured format found, treat entire response as analysis
  if (!parts.analysis && !parts.correctAnswer) {
    parts.analysis = text;
  }

  return parts;                                        // Return parsed sections
}

// ===== HTML ESCAPE FUNCTION =====
/**
 * Convert HTML special characters to safe entities
 * Prevents HTML injection attacks when displaying user content
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
function escapeHtml(text) {
  // Create temporary div element
  const div = document.createElement("div");
  // Set text content (automatically escapes HTML characters)
  div.textContent = text;
  // Return escaped HTML
  return div.innerHTML;
}
