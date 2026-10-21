// File: main.js
// Integrasi Logika Data dan Render ke Elemen DOM
// Dikembangkan untuk Tugas Mandiri: Interactive Portfolio Tracker

let projects = [
  {
    id: 1,
    title: "Sistem Inventaris Keuangan",
    category: "Web App",
    budget: 2500000,
    completed: true
  },
  {
    id: 2,
    title: "Sistem Kasir Digital POS",
    category: "Desktop App",
    budget: 5000000,
    completed: true
  },
  {
    id: 3,
    title: "Landing Page Profil Perusahaan",
    category: "Web App",
    budget: 1500000,
    completed: false
  },
  {
    id: 4,
    title: "Aplikasi Presensi GPS Mobile",
    category: "Mobile App",
    budget: 4500000,
    completed: false
  }
];

// State filter aktif (kategori + kata kunci pencarian)
let selectedCategory = "Semua";
let searchKeyword = "";

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

const updateStats = (dataList) => {
  const totalProjects = dataList.length;
  const totalBudget = dataList.reduce((acc, curr) => acc + curr.budget, 0);
  const completedCount = dataList.filter(item => item.completed).length;

  document.getElementById("stat-total-projects").textContent = totalProjects;
  document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
  document.getElementById("stat-completed-projects").textContent = completedCount;
};

const renderProjects = (filteredList) => {
  const container = document.getElementById("project-list");
  if (!container) return;

  if (filteredList.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: #64748b; padding: 20px;'>Tidak ada proyek pada kategori ini.</p>";
    return;
  }

  const htmlString = filteredList.map(proj => {
    const badgeClass = proj.completed ? "badge-success" : "badge-pending";
    const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";

    return `
      <div class="project-card">
        <div class="project-info">
          <span class="project-category">${proj.category}</span>
          <h4>${proj.title}</h4>
          <p class="project-budget">${formatRupiah(proj.budget)}</p>
        </div>
        <div class="card-actions">
          <span class="badge ${badgeClass}">${statusText}</span>
          <button class="btn-action btn-toggle" data-id="${proj.id}">Ubah Status</button>
          <button class="btn-action btn-delete" data-id="${proj.id}">Hapus Proyek</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = htmlString;
};

// Menggabungkan filter kategori dan pencarian, lalu render ulang tampilan + statistik
const refreshView = () => {
  const filtered = projects
    .filter(p => selectedCategory === "Semua" || p.category === selectedCategory)
    .filter(p => p.title.toLowerCase().includes(searchKeyword.toLowerCase()));

  renderProjects(filtered);
  updateStats(projects);
};

document.addEventListener("DOMContentLoaded", () => {
  refreshView();

  // Filter kategori
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");

      selectedCategory = e.target.getAttribute("data-category");
      refreshView();
    });
  });

  // Fitur 1: Form input proyek dinamis (submit + validasi)
  const form = document.getElementById("project-form");
  const errorEl = document.getElementById("form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("input-title").value.trim();
    const category = document.getElementById("input-category").value;
    const budget = Number(document.getElementById("input-budget").value);
    const completed = document.getElementById("input-completed").checked;

    // Validasi: judul tidak boleh kosong, anggaran harus > 0
    if (title === "") {
      errorEl.textContent = "Judul proyek tidak boleh kosong.";
      return;
    }
    if (!(budget > 0)) {
      errorEl.textContent = "Estimasi anggaran harus lebih besar dari 0.";
      return;
    }
    errorEl.textContent = "";

    const newProject = {
      id: Date.now(),
      title: title,
      category: category,
      budget: budget,
      completed: completed
    };

    // Masukkan ke array menggunakan spread operator
    projects = [...projects, newProject];

    form.reset();
    refreshView();
  });

  // Fitur 2: Pencarian real-time (event 'input')
  document.getElementById("search-input").addEventListener("input", (e) => {
    searchKeyword = e.target.value;
    refreshView();
  });

  // Fitur 3: Aksi kartu (Ubah Status & Hapus) lewat event delegation
  document.getElementById("project-list").addEventListener("click", (e) => {
    const id = Number(e.target.getAttribute("data-id"));
    if (!id) return;

    if (e.target.classList.contains("btn-toggle")) {
      projects = projects.map(p =>
        p.id === id ? { ...p, completed: !p.completed } : p
      );
      refreshView();
    } else if (e.target.classList.contains("btn-delete")) {
      projects = projects.filter(p => p.id !== id);
      refreshView();
    }
  });
});
