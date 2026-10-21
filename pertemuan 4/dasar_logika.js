const namaProgammer = "asad badriana"
const tahunMulai = 2022
const tahunSekarang = new Date().getFullYear();

const hitungPengalaman = (mulai, sekarang) => sekarang - mulai;
const masaKerja = hitungPengalaman(tahunMulai, tahunSekarang);

const statusSenioritas = masakerja >= 2? "Mid-Level Developer" : "junior Developer"

console.log("===INFORMASI PENGEMBANG===");
console.log(`Nama : ${namaProgrammer}`);
console.log(`Pengalaman : ${masaKerja} tahun`);
console.log(`Kategori : ${statusSenioritas}`);

console.log("\n=== UJI PERBANDINGAN TIPE DATA ===");
console.log("10 == '10' :", 10 == '10'); // true (type coercion)
console.log("10 === '10' :", 10 === '10'); // false (strict equality)
console.log("Tipe 10 :", typeof 10);
console.log("Tipe '10' :", typeof '10');