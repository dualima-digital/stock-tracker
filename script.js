async function loadList() {
  try {
    let res = await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
    let items = await res.json();
    let tbody = document.getElementById("listForm");
    tbody.innerHTML = "";

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No items to buy right now.</td></tr>`;
      return;
    }

    items.forEach(item => {
      let product = Array.isArray(item) ? item[0] : item;
      if (product) {
        let row = document.createElement("tr");
        row.innerHTML = `
          <td>${product}</td>
          <td><input type="checkbox" name="done" value="${product}"></td>
          <td><input type="checkbox" name="skip" value="${product}"></td>
        `;
        tbody.appendChild(row);
      }
    });
  } catch (err) {
    console.error("Error loading list:", err);
    document.getElementById("listForm").innerHTML =
      `<tr><td colspan="3">Error loading list.</td></tr>`;
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
