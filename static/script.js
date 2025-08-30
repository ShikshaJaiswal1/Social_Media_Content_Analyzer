const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const resultDiv = document.getElementById("result");

// Browse button
if (browseBtn) browseBtn.addEventListener("click", () => fileInput.click());

// Drag & Drop
if (uploadBox) {
  uploadBox.addEventListener("dragover", e => { e.preventDefault(); uploadBox.classList.add("drag-over"); });
  uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("drag-over"));
  uploadBox.addEventListener("drop", e => {
    e.preventDefault();
    uploadBox.classList.remove("drag-over");
    fileInput.files = e.dataTransfer.files;
    handleFileUpload();
  });
}
if (fileInput) fileInput.addEventListener("change", handleFileUpload);

async function handleFileUpload() {
  if (fileInput.files.length === 0) return;
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  resultDiv.classList.add("hidden");

  try {
    const response = await fetch("/upload", { method: "POST", body: formData });
    const result = await response.json();

    resultDiv.classList.remove("hidden");

    if (result.error) {
      resultDiv.innerHTML = `<div class="result-card error show full">⚠️ <b>Error:</b> ${result.error}</div>`;
      showToast(`⚠️ ${result.error}`, true); // 🔴 error toast
      return;
    }

    let sentimentEmoji = "😐";
    if (result.sentiment > 0.3) sentimentEmoji = "😊";
    else if (result.sentiment < -0.3) sentimentEmoji = "😞";

    const wordLimit = 150;
    const progress = Math.min((result.word_count / wordLimit) * 100, 100);

    resultDiv.innerHTML = `
      <div class="result-card full"><h3>📄 Extracted Text</h3><pre>${result.extracted_text}</pre></div>
      <div class="result-card"><h3>📊 Analysis</h3>
        <p><b>Word Count:</b> ${result.word_count}</p>
        <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
        <p><b>Sentiment:</b> ${result.sentiment.toFixed(2)} ${sentimentEmoji}</p>
        <div class="tags">${result.hashtags.length ? result.hashtags.map(h => `<span class="tag">#${h}</span>`).join("") : "No hashtags"}</div>
      </div>
      <div class="result-card"><h3>💡 Suggestions</h3>
        <ul>${result.suggestions.map(s => `<li>✨ ${s}</li>`).join("")}</ul>
      </div>
    `;

    // Animate cards one by one
    document.querySelectorAll(".result-card").forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(15px)";
      setTimeout(() => {
        card.classList.add("show");
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, i * 200);
    });

    // ✅ success toast
    showToast("✅ Analysis complete!");

  } catch (err) {
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `<div class="result-card error show full">⚠️ <b>Error:</b> ${err.message}</div>`;
    showToast(`⚠️ ${err.message}`, true); // 🔴 error toast
  }
}

// 🔧 Toast function
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden", "error");
  if (isError) toast.classList.add("error");
  setTimeout(() => toast.classList.add("show"), 50);

  // Auto-hide after 3s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 400);
  }, 3000);
}
