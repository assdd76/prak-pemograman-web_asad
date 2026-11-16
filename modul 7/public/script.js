// File: public/script.js
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/api/mahasiswa";

    // Data utama di sisi frontend (hasil fetch dari backend)
    let listMahasiswa = [];

    // 1. Tangkap elemen DOM
    const form = document.querySelector("#formMahasiswa");
    const inputId = document.querySelector("#inputId");
    const inputNim = document.querySelector("#inputNim");
    const inputNama = document.querySelector("#inputNama");
    const inputJurusan = document.querySelector("#inputJurusan");
    const inputEmail = document.querySelector("#inputEmail");
    const btnSubmit = document.querySelector("#btnSubmit");
    const btnCancel = document.querySelector("#btnCancel");
    const statusMessage = document.querySelector("#statusMessage");
    const totalCounter = document.querySelector("#totalCounter");
    const searchInput = document.querySelector("#searchInput");
    const tabelBody = document.querySelector("#tabelBody");

    // Helper: cegah injeksi HTML saat menampilkan data
    const escapeHTML = (nilai) =>
        String(nilai ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    const tampilkanStatus = (pesan, isError = false) => {
        statusMessage.textContent = pesan;
        statusMessage.className = isError ? "status-msg error" : "status-msg";
    };

    // ==========================================================
    // FITUR 3: Counter total mahasiswa
    // Dipanggil setiap kali listMahasiswa berubah (setelah tambah/hapus)
    // ==========================================================
    const updateCounter = () => {
        totalCounter.textContent = `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;
    };

    // ==========================================================
    // FITUR 1: Render tabel + filter pencarian real-time
    // ==========================================================
    const renderTable = () => {
        const keyword = searchInput.value.trim().toLowerCase();

        // Saring listMahasiswa berdasarkan kata kunci
        const hasil = listMahasiswa.filter((m) =>
            [m.nim, m.nama, m.jurusan, m.email].some((kolom) =>
                String(kolom ?? "").toLowerCase().includes(keyword)
            )
        );

        if (hasil.length === 0) {
            const teks = listMahasiswa.length === 0
                ? "Belum ada data mahasiswa."
                : "Tidak ada data yang cocok dengan pencarian.";
            tabelBody.innerHTML = `<tr><td colspan="6" class="empty-row">${teks}</td></tr>`;
            return;
        }

        tabelBody.innerHTML = hasil.map((m, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(m.nim)}</td>
                <td>${escapeHTML(m.nama)}</td>
                <td>${escapeHTML(m.jurusan)}</td>
                <td>${escapeHTML(m.email)}</td>
                <td class="aksi">
                    <button class="btn-edit" data-id="${m.id}">Edit</button>
                    <button class="btn-delete" data-id="${m.id}">Hapus</button>
                </td>
            </tr>
        `).join("");
    };

    // Event listener 'input': tabel tersaring setiap kali pengguna mengetik
    searchInput.addEventListener("input", renderTable);

    // 2. READ: Ambil seluruh data dari backend
    const loadData = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Status HTTP: ${response.status}`);
            }
            listMahasiswa = await response.json();
            updateCounter();
            renderTable();
            tampilkanStatus("Data berhasil dimuat.");
        } catch (error) {
            tampilkanStatus(`Gagal memuat data: ${error.message}`, true);
        }
    };

    // Kembalikan form ke mode "tambah"
    const resetForm = () => {
        form.reset();
        inputId.value = "";
        btnSubmit.textContent = "Simpan Data";
        btnCancel.hidden = true;
    };

    // 3. CREATE / UPDATE: Submit form
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nim = inputNim.value.trim();
        const nama = inputNama.value.trim();
        const jurusan = inputJurusan.value.trim();
        const email = inputEmail.value.trim();
        const idEdit = inputId.value; // kosong = mode tambah

        // ======================================================
        // FITUR 2: Validasi NIM duplikat menggunakan .some()
        // Saat mode edit, data milik dirinya sendiri dikecualikan
        // ======================================================
        const nimSudahAda = listMahasiswa.some(
            (m) => String(m.nim).trim() === nim && String(m.id) !== idEdit
        );
        if (nimSudahAda) {
            alert("NIM sudah terdaftar!");
            return; // batalkan submit, fetch() tidak dijalankan
        }

        const isEdit = idEdit !== "";
        const url = isEdit ? `${API_URL}/${idEdit}` : API_URL;
        const method = isEdit ? "PUT" : "POST";

        btnSubmit.disabled = true;
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nim, nama, jurusan, email })
            });
            const hasil = await response.json();

            if (!response.ok || !hasil.success) {
                throw new Error(hasil.message || `Status HTTP: ${response.status}`);
            }

            resetForm();
            await loadData(); // muat ulang -> counter ikut diperbarui
            tampilkanStatus(hasil.message);
        } catch (error) {
            tampilkanStatus(`Gagal menyimpan data: ${error.message}`, true);
        } finally {
            btnSubmit.disabled = false;
        }
    });

    btnCancel.addEventListener("click", resetForm);

    // 4. Event delegation untuk tombol Edit dan Hapus di dalam tabel
    tabelBody.addEventListener("click", async (event) => {
        const tombol = event.target.closest("button");
        if (!tombol) return;

        const id = tombol.dataset.id;

        // EDIT: isi form dengan data yang dipilih
        if (tombol.classList.contains("btn-edit")) {
            const m = listMahasiswa.find((item) => String(item.id) === id);
            if (!m) return;
            inputId.value = m.id;
            inputNim.value = m.nim;
            inputNama.value = m.nama;
            inputJurusan.value = m.jurusan;
            inputEmail.value = m.email;
            btnSubmit.textContent = "Perbarui Data";
            btnCancel.hidden = false;
            inputNim.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // DELETE: hapus data lalu muat ulang
        if (tombol.classList.contains("btn-delete")) {
            if (!confirm("Yakin ingin menghapus data ini?")) return;
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                const hasil = await response.json();

                if (!response.ok || !hasil.success) {
                    throw new Error(hasil.message || `Status HTTP: ${response.status}`);
                }

                // Jika yang dihapus sedang diedit, reset form
                if (inputId.value === id) resetForm();

                await loadData(); // muat ulang -> counter ikut diperbarui
                tampilkanStatus(hasil.message);
            } catch (error) {
                tampilkanStatus(`Gagal menghapus data: ${error.message}`, true);
            }
        }
    });

    // Muat data pertama kali saat halaman dibuka
    loadData();
});
