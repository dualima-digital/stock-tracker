// Replace with your actual Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbxz73Cq_qqjiniriidhm2Q0LeCCEV4vhp7REP0qAIC6we_HWVrCBk6pqbi5Vp33DxioeQ/exec";
const API_TOKEN = "baraganteng"; // must match backend

async function loadList() {
  let res = await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
  let items = await res.json();
  let form = document.getElementById("listForm");
  form.innerHTML = "";
  items.forEach(item => {
    let div = document.createElement("div");
    div.innerHTML = `
      <label>
        <input type="checkbox" name="skip" value="${item[0]}"> Skip ${item[0]}
      </label>
    `;
    form.appendChild(div);
  });
}

async function submitList() {
  let skipped = Array.from(document.querySelectorAll("input[name=skip]:checked"))
                     .map(cb => cb.value);
  for (let item of skipped) {
    await fetch(`${API_URL}?action=skipItem&item=${encodeURIComponent(item)}&token=${API_TOKEN}`);
  }
  loadList(); // refresh list
}

async function loadItems() {
  let res = await fetch(`${API_URL}?action=getItems&token=${API_TOKEN}`);
  let items = await res.json();
  let dropdown = document.getElementById("itemDropdown");
  dropdown.innerHTML = "";
  items.forEach(item => {
    let opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    dropdown.appendChild(opt);
  });
}

async function submitUpdate() {
  let item = document.getElementById("itemDropdown").value;
  let qty = document.getElementById("qty").value;
  let type = document.getElementById("type").value;
  await fetch(`${API_URL}?action=updateStock&item=${encodeURIComponent(item)}&qty=${qty}&type=${type}&token=${API_TOKEN}`);
  alert("Stock updated!");
}
