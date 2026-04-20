const API_URL = "https://script.google.com/macros/s/AKfycbwNA5tYvCjiO3mNIUt2-yJHiu5w8c8KEbV75n2Hvqevr3C3wlyqcXLedmRt72IpjETgpA/exec";
const API_TOKEN = "baraganteng";

// ---------------- LIST TO BUY ----------------
async function loadList() {
  try {
    let res = await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
    let items = await res.json();
    let form = document.getElementById("listForm");
    form.innerHTML = "";

    if (!items || items.length === 0) {
      form.innerHTML = "<p>No items to buy right now.</p>";
      return;
    }

    items.forEach(item => {
      let product = Array.isArray(item) ? item[0] : item;
      if (product) {
        let div = document.createElement("div");
        div.className = "item-row";
        div.innerHTML = `
          <span>${product}</span>
          <label><input type="checkbox" name="done" value="${product}"> DONE</label>
          <label><input type="checkbox" name="skip" value="${product}"> SKIP</label>
        `;
        form.appendChild(div);
      }
    });
  } catch (err) {
    console.error("Error loading list:", err);
    document.getElementById("listForm").innerHTML = "<p>Error loading list.</p>";
  }
}

async function submitList() {
  let doneItems = Array.from(document.querySelectorAll("input[name=done]:checked"))
                       .map(cb => cb.value);
  let skippedItems = Array.from(document.querySelectorAll("input[name=skip]:checked"))
                          .map(cb => cb.value);

  if (doneItems.length === 0 && skippedItems.length === 0) {
    alert("No items selected.");
    return;
  }

  if (!confirm("Are you sure you want to process selected items?")) return;

  // DONE items → add to stock (qty=1) and clear from list
  for (let item of doneItems) {
    await fetch(`${API_URL}?action=doneItem&item=${encodeURIComponent(item)}&token=${API_TOKEN}`);
  }

  // SKIP items → mark skipped
  for (let item of skippedItems) {
    await fetch(`${API_URL}?action=skipItem&item=${encodeURIComponent(item)}&token=${API_TOKEN}`);
  }

  alert("Submission complete! DONE items added to stock, SKIP items marked.");
  loadList(); // refresh list after submit
}
