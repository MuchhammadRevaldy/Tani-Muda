/* @ds-bundle: {"format":4,"namespace":"TaniMuda","components":[{"name":"Tombol"},{"name":"Kartu"},{"name":"KolomIsian"},{"name":"InputRupiah"},{"name":"Uang"},{"name":"ChipStatus"},{"name":"BarisTugas"},{"name":"PenggarisUmurTanam"},{"name":"Banner"},{"name":"NavigasiBawah"},{"name":"Ikon"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;

  var IKON = {"beranda": "<path d=\"M3.5 10.5 12 3.8l8.5 6.7\"/><path d=\"M5.8 9v10.2c0 .5.4.8.8.8H10v-5.5h4V20h3.4c.4 0 .8-.3.8-.8V9\"/>","kebun": "<path d=\"M12 20.5v-8.5\"/><path d=\"M12 12c0-3.9-2.6-6.5-7.5-6.5 0 4.2 2.8 6.5 7.5 6.5Z\"/><path d=\"M12 14.5c0-3.4 2.3-5.8 7-5.8 0 3.6-2.6 5.8-7 5.8Z\"/><path d=\"M4.5 20.5h15\"/>","pesanan": "<path d=\"M6 3.5h12v17l-2.4-1.6-2.4 1.6-1.2-.8-1.2.8-2.4-1.6L6 20.5Z\"/><path d=\"M9.5 8.5h5\"/><path d=\"M9.5 12.5h5\"/>","belajar": "<path d=\"M12 6.8C10.4 5.2 7.9 4.6 3.8 4.6v13.2c4.1 0 6.6.6 8.2 2.2 1.6-1.6 4.1-2.2 8.2-2.2V4.6c-4.1 0-6.6.6-8.2 2.2Z\"/><path d=\"M12 6.8V20\"/>","centang": "<path d=\"M5 12.6 9.6 17.2 19 7.6\"/>","kamera": "<path d=\"M3.8 8.6c0-.9.7-1.6 1.6-1.6h2.3l1.6-2.5h5.4L16.3 7h2.3c.9 0 1.6.7 1.6 1.6v9.3c0 .9-.7 1.6-1.6 1.6H5.4c-.9 0-1.6-.7-1.6-1.6Z\"/><circle cx=\"12\" cy=\"12.8\" r=\"3.4\"/>","jam": "<circle cx=\"12\" cy=\"12\" r=\"8.2\"/><path d=\"M12 7.6V12l3 2\"/>","peringatan": "<path d=\"M10.4 4.4 3 17.6c-.7 1.2.2 2.7 1.6 2.7h14.8c1.4 0 2.3-1.5 1.6-2.7L13.6 4.4c-.7-1.2-2.5-1.2-3.2 0Z\"/><path d=\"M12 9.4v4.2\"/><path d=\"M12 16.9h.01\"/>","kunci": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5\"/><path d=\"M12 14.4v2.4\"/>","jam-pasir": "<path d=\"M6.5 3.5h11\"/><path d=\"M6.5 20.5h11\"/><path d=\"M8 3.5v2.2c0 2.3 4 4 4 6.3s-4 4-4 6.3v2.2\"/><path d=\"M16 3.5v2.2c0 2.3-4 4-4 6.3s4 4 4 6.3v2.2\"/>","uang": "<rect x=\"2.8\" y=\"6.5\" width=\"18.4\" height=\"11\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M6.4 10v4\"/><path d=\"M17.6 10v4\"/>","offline": "<path d=\"M3.5 3.5l17 17\"/><path d=\"M9.4 6.4a5.6 5.6 0 0 1 8 3.6 4.1 4.1 0 0 1 2.5 6.6\"/><path d=\"M16.6 18.3H7.2a4.3 4.3 0 0 1-.9-8.5\"/>","panen": "<path d=\"M3.8 10.2h16.4l-1.7 8.6c-.2.9-1 1.5-1.9 1.5H7.4c-.9 0-1.7-.6-1.9-1.5Z\"/><path d=\"M8 10.2 11 4.6\"/><path d=\"M16 10.2 13 4.6\"/><path d=\"M9.6 13.6v3.2\"/><path d=\"M14.4 13.6v3.2\"/>","lonceng": "<path d=\"M6.2 16.6v-5.4a5.8 5.8 0 0 1 11.6 0v5.4l1.7 1.7h-15Z\"/><path d=\"M10 20.6a2.1 2.1 0 0 0 4 0\"/>","panah-kanan": "<path d=\"M9.5 5.8 15.7 12l-6.2 6.2\"/>","panah-kiri": "<path d=\"M14.5 5.8 8.3 12l6.2 6.2\"/>"};

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }
  function tanpa(obj, kunci) {
    var out = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && kunci.indexOf(k) < 0) out[k] = obj[k];
    return out;
  }
  var idUrut = 0;
  function useIdAman() {
    if (React.useId) return React.useId();
    var r = React.useRef(null);
    if (r.current === null) r.current = "tm-" + (++idUrut);
    return r.current;
  }

  /* ---------- angka dan uang ---------- */
  function titikRibuan(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function formatRupiah(n) {
    if (n === null || n === undefined || isNaN(n)) return "";
    var bulat = Math.round(Math.abs(Number(n)));
    return (Number(n) < 0 ? "−" : "") + "Rp" + titikRibuan(bulat);
  }
  var SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  function eja(n) {
    if (n < 12) return SATUAN[n];
    if (n < 20) return eja(n - 10) + " belas";
    if (n < 100) return eja(Math.floor(n / 10)) + " puluh" + (n % 10 ? " " + eja(n % 10) : "");
    if (n < 200) return "seratus" + (n - 100 ? " " + eja(n - 100) : "");
    if (n < 1000) return eja(Math.floor(n / 100)) + " ratus" + (n % 100 ? " " + eja(n % 100) : "");
    if (n < 2000) return "seribu" + (n - 1000 ? " " + eja(n - 1000) : "");
    if (n < 1e6) return eja(Math.floor(n / 1000)) + " ribu" + (n % 1000 ? " " + eja(n % 1000) : "");
    if (n < 1e9) return eja(Math.floor(n / 1e6)) + " juta" + (n % 1e6 ? " " + eja(n % 1e6) : "");
    if (n < 1e12) return eja(Math.floor(n / 1e9)) + " miliar" + (n % 1e9 ? " " + eja(n % 1e9) : "");
    return eja(Math.floor(n / 1e12)) + " triliun" + (n % 1e12 ? " " + eja(n % 1e12) : "");
  }
  function terbilang(n) {
    if (n === null || n === undefined || isNaN(n)) return "";
    var b = Math.floor(Math.abs(Number(n)));
    var kata = b === 0 ? "nol" : eja(b);
    return kata.charAt(0).toUpperCase() + kata.slice(1) + " rupiah";
  }

  /* ---------- Ikon ---------- */
  function Ikon(p) {
    var s = p.ukuran || 24;
    var berlabel = !!p.label;
    return h("svg", {
      className: cx("tm-ikon", p.className),
      width: s, height: s, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: p.tebal || 2, strokeLinecap: "round", strokeLinejoin: "round",
      role: berlabel ? "img" : undefined,
      "aria-label": berlabel ? p.label : undefined,
      "aria-hidden": berlabel ? undefined : "true",
      focusable: "false",
      dangerouslySetInnerHTML: { __html: IKON[p.nama] || "" }
    });
  }

  /* ---------- Tombol ---------- */
  function Tombol(p) {
    var varian = p.varian || "utama";
    var lain = tanpa(p, ["varian", "ikon", "penuh", "className", "children", "type"]);
    return h("button", Object.assign({
      type: p.type || "button",
      className: cx("tm-tombol", "tm-tombol--" + varian, p.penuh && "tm-tombol--penuh", p.className)
    }, lain),
      p.ikon ? h(Ikon, { nama: p.ikon }) : null,
      h("span", null, p.children));
  }

  /* ---------- Kartu ---------- */
  function Kartu(p) {
    var lain = tanpa(p, ["judul", "keterangan", "kanan", "kaki", "nadaKaki", "children", "className", "tanpaIsi", "tingkatJudul"]);
    var adaKepala = p.judul || p.keterangan || p.kanan;
    var Judul = "h" + (p.tingkatJudul || 3);
    return h("section", Object.assign({ className: cx("tm-kartu", p.className) }, lain),
      adaKepala ? h("div", { className: "tm-kartu__kepala" },
        h("div", { className: "tm-kartu__judulblok" },
          p.judul ? h(Judul, { className: "tm-kartu__judul" }, p.judul) : null,
          p.keterangan ? h("p", { className: "tm-kartu__keterangan" }, p.keterangan) : null),
        p.kanan ? h("div", { className: "tm-kartu__kanan" }, p.kanan) : null) : null,
      p.children != null ? h("div", { className: p.tanpaIsi ? "tm-kartu__isi tm-kartu__isi--rapat" : "tm-kartu__isi" }, p.children) : null,
      p.kaki ? h("div", { className: cx("tm-kartu__kaki", p.nadaKaki === "uang" && "tm-kartu__kaki--uang") }, p.kaki) : null);
  }

  /* ---------- KolomIsian ---------- */
  function PesanKolom(p) {
    if (p.galat) return h("p", { id: p.id + "-pesan", className: "tm-kolom__galat" }, h(Ikon, { nama: "peringatan", ukuran: 20 }), h("span", null, p.galat));
    if (p.bantuan) return h("p", { id: p.id + "-pesan", className: "tm-kolom__bantuan" }, p.bantuan);
    return null;
  }
  function KolomIsian(p) {
    var autoId = useIdAman();
    var id = p.id || autoId;
    var lain = tanpa(p, ["label", "bantuan", "galat", "akhiran", "className", "id"]);
    var adaPesan = !!(p.galat || p.bantuan);
    return h("div", { className: cx("tm-kolom", p.galat && "tm-kolom--galat", p.className) },
      h("label", { htmlFor: id, className: "tm-kolom__label" }, p.label),
      h("div", { className: "tm-kolom__bingkai" },
        h("input", Object.assign({
          id: id, className: "tm-kolom__input",
          "aria-invalid": p.galat ? "true" : undefined,
          "aria-describedby": adaPesan ? id + "-pesan" : undefined
        }, lain)),
        p.akhiran ? h("span", { className: "tm-kolom__akhiran", "aria-hidden": "true" }, p.akhiran) : null),
      h(PesanKolom, { id: id, galat: p.galat, bantuan: p.bantuan }));
  }

  /* ---------- InputRupiah ---------- */
  function InputRupiah(p) {
    var autoId = useIdAman();
    var id = p.id || autoId;
    var terkendali = p.nilai !== undefined;
    var st = React.useState(p.nilaiAwal != null ? p.nilaiAwal : null);
    var nilai = terkendali ? p.nilai : st[0];
    var ref = React.useRef(null);
    var kursor = React.useRef(null);
    var tampil = nilai == null || isNaN(nilai) ? "" : titikRibuan(Math.round(nilai));

    React.useLayoutEffect(function () {
      var el = ref.current;
      if (kursor.current == null || !el || document.activeElement !== el) { kursor.current = null; return; }
      var target = kursor.current, v = el.value, hitung = 0, i = 0;
      if (target > 0) {
        for (i = 0; i < v.length; i++) {
          if (/\d/.test(v[i])) { hitung++; if (hitung === target) { i++; break; } }
        }
      }
      el.setSelectionRange(i, i);
      kursor.current = null;
    });

    function ubah(e) {
      var el = e.target;
      var pos = el.selectionStart == null ? el.value.length : el.selectionStart;
      var angka = el.value.replace(/\D/g, "");
      var nolDepan = (angka.match(/^0+(?=\d)/) || [""])[0].length;
      var sebelum = el.value.slice(0, pos).replace(/\D/g, "").length - nolDepan;
      angka = angka.slice(nolDepan).slice(0, 13);
      kursor.current = Math.max(0, sebelum);
      var n = angka === "" ? null : Number(angka);
      if (!terkendali) st[1](n);
      if (p.onUbah) p.onUbah(n);
    }

    var lain = tanpa(p, ["label", "bantuan", "galat", "nilai", "nilaiAwal", "onUbah", "className", "id", "tanpaTerbilang", "akhiran"]);
    var pesanBantuan = p.bantuan || (!p.tanpaTerbilang && nilai ? terbilang(nilai) : null);
    var adaPesan = !!(p.galat || pesanBantuan);
    return h("div", { className: cx("tm-kolom", "tm-rupiah", p.galat && "tm-kolom--galat", p.className) },
      h("label", { htmlFor: id, className: "tm-kolom__label" }, p.label),
      h("div", { className: "tm-kolom__bingkai" },
        h("span", { className: "tm-rupiah__awalan", "aria-hidden": "true" }, "Rp"),
        h("input", Object.assign({
          ref: ref, id: id, className: "tm-kolom__input tm-rupiah__input",
          inputMode: "numeric", autoComplete: "off", placeholder: "0",
          value: tampil, onChange: ubah,
          "aria-invalid": p.galat ? "true" : undefined,
          "aria-describedby": adaPesan ? id + "-pesan" : undefined
        }, lain)),
        p.akhiran ? h("span", { className: "tm-kolom__akhiran", "aria-hidden": "true" }, p.akhiran) : null),
      h(PesanKolom, { id: id, galat: p.galat, bantuan: pesanBantuan }));
  }

  /* ---------- Uang ---------- */
  function Uang(p) {
    var rugi = Number(p.nilai) < 0;
    var angka = h("span", { className: cx("tm-uang__angka", p.besar && "tm-uang__angka--besar", rugi && "tm-uang__angka--rugi") }, formatRupiah(p.nilai));
    if (!p.label) return h("span", { className: cx("tm-uang", p.className) }, angka);
    return h("div", { className: cx("tm-uang", "tm-uang--berlabel", p.className) },
      h("span", { className: "tm-uang__label" }, p.label),
      angka,
      p.keterangan ? h("span", { className: "tm-uang__keterangan" }, p.keterangan) : null);
  }

  /* ---------- ChipStatus ---------- */
  var STATUS = {
    "selesai": { label: "Selesai", ikon: "centang" },
    "hari-ini": { label: "Hari ini", ikon: null },
    "besok": { label: "Besok", ikon: "jam" },
    "terlambat": { label: "Terlambat", ikon: "peringatan" },
    "uang-muka-ditahan": { label: "Uang muka ditahan", ikon: "kunci" },
    "menunggu-konfirmasi": { label: "Menunggu konfirmasi", ikon: "jam-pasir" },
    "dana-cair": { label: "Dana cair", ikon: "uang" }
  };
  function ChipStatus(p) {
    var kunci = STATUS[p.status] ? p.status : "hari-ini";
    var s = STATUS[kunci];
    return h("span", { className: cx("tm-chip", "tm-chip--" + kunci, p.className) },
      s.ikon ? h(Ikon, { nama: s.ikon, ukuran: 18, tebal: 2.25 }) : h("span", { className: "tm-chip__titik", "aria-hidden": "true" }),
      h("span", null, p.children || s.label));
  }

  /* ---------- BarisTugas ---------- */
  function BarisTugas(p) {
    var terkendali = p.selesai !== undefined;
    var st = React.useState(!!p.selesaiAwal);
    var selesai = terkendali ? !!p.selesai : st[0];
    function centang() {
      if (!terkendali) st[1](!selesai);
      if (p.onCentang) p.onCentang(!selesai);
    }
    var foto = p.jumlahFoto || 0;
    var chip = selesai ? h(ChipStatus, { status: "selesai" }) : (p.waktu ? h(ChipStatus, { status: p.waktu }) : null);
    return h("div", { className: cx("tm-tugas", selesai && "tm-tugas--selesai", p.className) },
      h("button", {
        type: "button", className: "tm-tugas__centang", role: "checkbox",
        "aria-checked": selesai ? "true" : "false",
        "aria-label": (selesai ? "Batalkan selesai: " : "Tandai selesai: ") + p.judul,
        onClick: centang
      }, h("span", { className: "tm-tugas__lingkaran" }, selesai ? h(Ikon, { nama: "centang", ukuran: 20, tebal: 3 }) : null)),
      h("div", { className: "tm-tugas__teks" },
        h("span", { className: "tm-tugas__judul" }, p.judul),
        (p.keterangan || chip) ? h("span", { className: "tm-tugas__meta" },
          p.keterangan ? h("span", null, p.keterangan) : null,
          chip) : null),
      p.tanpaKamera ? null : h("button", {
        type: "button", className: "tm-tugas__kamera",
        "aria-label": foto ? "Foto bukti, " + foto + " foto. Tambah foto" : "Tambah foto bukti",
        onClick: p.onKamera
      }, h(Ikon, { nama: "kamera" }), foto ? h("span", { className: "tm-tugas__jumlah", "aria-hidden": "true" }, foto) : null));
  }

  /* ---------- PenggarisUmurTanam ---------- */
  var kanvas = null;
  function lebarTeks(teks, berat) {
    try {
      if (!kanvas) kanvas = document.createElement("canvas").getContext("2d");
      kanvas.font = (berat || 400) + " 16px \"Plus Jakarta Sans\", system-ui, sans-serif";
      return Math.ceil(kanvas.measureText(teks).width);
    } catch (e) {
      return Math.ceil(teks.length * 9.5);
    }
  }
  var KATA_STATUS = { selesai: "selesai", besok: "besok", belum: "belum", terlambat: "terlambat", panen: "panen" };
  function statusJadwal(j, hariPanen) {
    if (j.status && KATA_STATUS[j.status]) return j.status;
    return j.hari >= hariPanen ? "panen" : "belum";
  }
  function frasaStatus(j, s, hariIni) {
    var selisih = j.hari - hariIni;
    if (s === "selesai") return "selesai";
    if (s === "besok") return "besok";
    if (s === "terlambat") return "terlambat" + (selisih < 0 ? " " + (-selisih) + " hari" : "");
    if (selisih === 0) return "hari ini";
    if (selisih > 0) return selisih + " hari lagi";
    return "";
  }
  function kalimatJadwal(j, s, hariIni) {
    var f = frasaStatus(j, s, hariIni);
    return "hari ke-" + j.hari + (f ? " \u00b7 " + f : "");
  }
  var IKON_PIN = { selesai: "centang", besok: "jam", terlambat: "peringatan", panen: "panen" };
  function Pin(p) {
    var s = p.status, u = p.ukuran;
    var ik = IKON_PIN[s];
    return h("span", {
      className: cx("tm-pin", "tm-pin--" + s, p.className),
      style: Object.assign({ width: u, height: u }, p.style || {}),
      "aria-hidden": "true"
    }, ik ? h(Ikon, { nama: ik, ukuran: Math.round(u * (s === "selesai" ? 0.62 : 0.56)), tebal: s === "selesai" ? 3 : 2.5 }) : null);
  }

  function PenggarisUmurTanam(p) {
    var varian = p.varian === "lebar" ? "lebar" : "hp";
    var hariPanen = Math.max(1, p.hariPanen || 28);
    var hariIni = Math.max(0, p.hariIni || 0);
    var jadwal = (p.jadwal || []).slice().sort(function (a, b) { return a.hari - b.hari; });
    var tampilDaftar = p.tampilkanDaftar !== undefined ? p.tampilkanDaftar : varian === "hp";

    var ref = React.useRef(null);
    var st = React.useState(0), W = st[0], setW = st[1];
    var fs = React.useState(0), setFont = fs[1];
    React.useLayoutEffect(function () {
      var el = ref.current;
      if (!el) return;
      setW(el.clientWidth);
      var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(function () { setW(el.clientWidth); }) : null;
      if (ro) ro.observe(el);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setFont(function (x) { return x + 1; }); });
      return function () { if (ro) ro.disconnect(); };
    }, []);

    var L = varian === "lebar";
    var pinU = L ? 32 : 28;
    var pad = L ? 24 : 16;
    var tinggiJalur = 10;
    var tangkaiMin = L ? 14 : 10;
    var labelPinH = L ? 72 : 0;
    var langkahLevel = pinU + 8 + labelPinH;
    var x0 = pad, x1 = Math.max(pad + 1, W - pad);
    function xHari(d) { return x0 + (Math.min(Math.max(d, 0), hariPanen) / hariPanen) * (x1 - x0); }

    var pins = jadwal.map(function (j) {
      var s = statusJadwal(j, hariPanen);
      var kal = kalimatJadwal(j, s, hariIni);
      var frasa = frasaStatus(j, s, hariIni);
      var lebarLabel = L ? Math.max(lebarTeks(j.label, 600), lebarTeks("Hari ke-" + j.hari, 400), lebarTeks(frasa, 500)) : pinU;
      return { j: j, s: s, kal: kal, frasa: frasa, x: xHari(j.hari), w: lebarLabel };
    });
    var celah = L ? 24 : 4;
    var tingkat = [];
    function jepit(kiri, w) { return L ? Math.min(Math.max(kiri, 0), Math.max(0, W - w)) : kiri; }
    function kandidat(pn) {
      return [pn.x - pn.w / 2, pn.x + pinU / 2 - pn.w, pn.x - pinU / 2].map(function (k) { return jepit(k, pn.w); });
    }
    function muat(lv, kiri, w) {
      var arr = tingkat[lv] || [];
      for (var i = 0; i < arr.length; i++) if (!(kiri + w + celah <= arr[i].kiri || kiri >= arr[i].kiri + arr[i].pn.w + celah)) return false;
      return true;
    }
    function taruh(lv, pn, kiri) {
      (tingkat[lv] = tingkat[lv] || []).push({ kiri: kiri, pn: pn });
      pn.kiri = kiri; pn.level = lv;
    }
    pins.forEach(function (pn) {
      for (var lv = 0; lv < 12; lv++) {
        var kd = kandidat(pn), i;
        for (i = 0; i < kd.length; i++) if (muat(lv, kd[i], pn.w)) { taruh(lv, pn, kd[i]); return; }
        var arr = tingkat[lv] || [], akhir = arr[arr.length - 1], sblm = arr[arr.length - 2];
        if (L && akhir) {
          var geser = jepit(akhir.pn.x + pinU / 2 - akhir.pn.w, akhir.pn.w);
          if (geser < akhir.kiri && (!sblm || geser >= sblm.kiri + sblm.pn.w + celah)) {
            for (i = 0; i < kd.length; i++) if (kd[i] >= geser + akhir.pn.w + celah) {
              akhir.kiri = geser; akhir.pn.kiri = geser; taruh(lv, pn, kd[i]); return;
            }
          }
        }
      }
      taruh(lv, pn, kandidat(pn)[0]);
    });
    var maxLv = pins.reduce(function (m, pn) { return Math.max(m, pn.level); }, 0);
    var zona = pins.length ? (maxLv + 1) * langkahLevel + tangkaiMin - 8 : 12;
    var yJalur = zona;
    var yLabel = yJalur + tinggiJalur + 12;
    var tinggi = yLabel + 32;

    var xIni = xHari(hariIni);
    var teksIni = "Hari ke-" + hariIni;
    var wIni = lebarTeks(teksIni, 600) + 24;
    var kiriIni = Math.min(Math.max(xIni - wIni / 2, 0), Math.max(0, W - wIni));
    function bertabrakan(kiri, lebar) {
      return !(kiri + lebar + 12 < kiriIni || kiri > kiriIni + wIni + 12);
    }

    var anak = [];
    if (W > 0) {
      anak.push(h("div", { key: "jalur", className: "tm-penggaris__jalur", style: { left: x0 - 5, width: x1 - x0 + 10, top: yJalur, height: tinggiJalur } },
        h("div", { className: "tm-penggaris__isi", style: { width: Math.max(0, xIni - x0 + 5) } })));
      var tik = [];
      for (var d = 7; d < hariPanen; d += 7) tik.push(d);
      tik.forEach(function (d) {
        anak.push(h("span", { key: "t" + d, className: "tm-penggaris__tik", style: { left: xHari(d) - 1, top: yJalur + tinggiJalur + 3 } }));
      });
      var ujung = [{ d: 0, teks: "Hari ke-0", rata: "kiri" }, { d: hariPanen, teks: "Hari ke-" + hariPanen, rata: "kanan" }];
      if (L) tik.forEach(function (d) { ujung.push({ d: d, teks: "Hari ke-" + d, rata: "tengah" }); });
      ujung.forEach(function (u) {
        var w = lebarTeks(u.teks, 400);
        var kiri = u.rata === "kiri" ? Math.max(0, xHari(u.d) - 12) : u.rata === "kanan" ? Math.min(W - w, xHari(u.d) + 12 - w) : xHari(u.d) - w / 2;
        if (bertabrakan(kiri, w)) return;
        if (L && pins.some(function (pn) { return pn.j.hari === u.d; })) return;
        anak.push(h("span", { key: "u" + u.d, className: "tm-penggaris__ujung", style: { left: kiri, top: yLabel + 5 } }, u.teks));
      });
      pins.forEach(function (pn, i) {
        var yPin = yJalur - tangkaiMin - pinU - pn.level * langkahLevel;
        anak.push(h("span", { key: "s" + i, className: "tm-penggaris__tangkai tm-penggaris__tangkai--" + pn.s, style: { left: pn.x, top: yPin + pinU, height: yJalur - (yPin + pinU) } }));
        anak.push(h(Pin, { key: "p" + i, status: pn.s, ukuran: pinU, style: { position: "absolute", left: pn.x - pinU / 2, top: yPin } }));
        if (L) {
          var kiri = pn.kiri;
          anak.push(h("span", { key: "l" + i, className: "tm-penggaris__labelpin", style: { left: kiri, width: pn.w, top: yPin - labelPinH + 2, textAlign: Math.abs(kiri + pn.w / 2 - pn.x) < 1 ? "center" : kiri + pn.w / 2 < pn.x ? "right" : "left" } },
            h("span", { className: "tm-penggaris__namapin" }, pn.j.label),
            h("span", { className: "tm-penggaris__kalimat" }, "Hari ke-" + pn.j.hari),
            pn.frasa ? h("span", { className: "tm-penggaris__kalimat tm-penggaris__kalimat--" + pn.s }, pn.frasa) : null));
        }
      });
      anak.push(h("span", { key: "ini", className: "tm-penggaris__penanda", style: { left: xIni - 2, top: yJalur - 8, height: yLabel - yJalur + 8 } }));
      anak.push(h("span", { key: "inil", className: "tm-penggaris__hariini", style: { left: kiriIni, top: yLabel } }, teksIni));
    }

    var ringkas = "Umur tanam hari ke-" + hariIni + " dari " + hariPanen + ". " + pins.map(function (pn) { return pn.j.label + ", " + pn.kal; }).join(". ") + ".";
    return h("div", { className: cx("tm-penggaris", "tm-penggaris--" + varian, p.className) },
      h("div", { ref: ref, className: "tm-penggaris__grafik", style: { height: tinggi }, role: "img", "aria-label": ringkas }, anak),
      tampilDaftar && pins.length ? h("ul", { className: "tm-penggaris__daftar" }, pins.map(function (pn, i) {
        return h("li", { key: i },
          h(Pin, { status: pn.s, ukuran: 24 }),
          h("span", { className: "tm-penggaris__namapin" }, pn.j.label),
          h("span", { className: "tm-penggaris__kalimat tm-penggaris__kalimat--" + pn.s }, pn.kal));
      })) : null);
  }

  /* ---------- Banner ---------- */
  var BANNER = {
    peringatan: { ikon: "lonceng", peran: "status" },
    bahaya: { ikon: "peringatan", peran: "alert" },
    offline: { ikon: "offline", peran: "status", judul: "Kamu sedang offline" }
  };
  function Banner(p) {
    var jenis = BANNER[p.jenis] ? p.jenis : "peringatan";
    var b = BANNER[jenis];
    var judul = p.judul || b.judul;
    var isi = p.children;
    if (jenis === "offline" && isi == null) {
      isi = p.tertunda ? p.tertunda + " catatan tersimpan di HP. Terkirim sendiri saat ada sinyal." : "Catatan tetap tersimpan di HP. Terkirim sendiri saat ada sinyal.";
    }
    return h("div", { className: cx("tm-banner", "tm-banner--" + jenis, p.className), role: b.peran },
      h(Ikon, { nama: b.ikon, className: "tm-banner__ikon" }),
      h("div", { className: "tm-banner__teks" },
        judul ? h("p", { className: "tm-banner__judul" }, judul) : null,
        isi ? h("p", { className: "tm-banner__isi" }, isi) : null,
        p.aksi ? h("button", { type: "button", className: "tm-banner__aksi", onClick: p.onAksi }, p.aksi) : null));
  }

  /* ---------- NavigasiBawah ---------- */
  var MENU = [
    { id: "beranda", label: "Beranda", ikon: "beranda" },
    { id: "kebun", label: "Kebun", ikon: "kebun" },
    { id: "pesanan", label: "Pesanan", ikon: "pesanan" },
    { id: "belajar", label: "Belajar", ikon: "belajar" }
  ];
  function NavigasiBawah(p) {
    var terkendali = p.aktif !== undefined;
    var st = React.useState(p.aktifAwal || "beranda");
    var aktif = terkendali ? p.aktif : st[0];
    var lencana = p.lencana || {};
    return h("nav", { className: cx("tm-nav", p.className), "aria-label": "Navigasi utama" },
      MENU.map(function (m) {
        var ini = m.id === aktif;
        var n = lencana[m.id];
        return h("button", {
          key: m.id, type: "button", className: "tm-nav__item",
          "aria-current": ini ? "page" : undefined,
          onClick: function () { if (!terkendali) st[1](m.id); if (p.onPilih) p.onPilih(m.id); }
        },
          h("span", { className: "tm-nav__ikon" }, h(Ikon, { nama: m.ikon }),
            n ? h("span", { className: "tm-nav__lencana" }, n > 99 ? "99+" : n) : null),
          h("span", { className: "tm-nav__label" }, m.label, n ? h("span", { className: "tm-sr" }, ", " + n + " baru") : null));
      }));
  }

  var api = {
    Tombol: Tombol, Kartu: Kartu, KolomIsian: KolomIsian, InputRupiah: InputRupiah, Uang: Uang,
    ChipStatus: ChipStatus, BarisTugas: BarisTugas, PenggarisUmurTanam: PenggarisUmurTanam,
    Banner: Banner, NavigasiBawah: NavigasiBawah, Ikon: Ikon,
    formatRupiah: formatRupiah, terbilang: terbilang, daftarIkon: Object.keys(IKON)
  };
  window.TaniMuda = Object.assign(window.TaniMuda || {}, api);
})();
