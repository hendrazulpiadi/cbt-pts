// ============================================================
// Google Apps Script - Penerima Data Hasil Ujian CBT
// Menulis data ke 5 kolom: Waktu | Nama | Kelas | Nilai Total | Rincian Jawaban
//
// Cara update setelah mengubah skrip ini:
// - Deploy > Manage deployments > (ikon pensil) > Version: New version > Deploy
//   (URL /exec tetap sama, tidak perlu ganti di cbt.html)
// ============================================================

const SPREADSHEET_ID = '1n38tipqErW-E7MfYE__FZBFQaHpmUmvIGigvM6vN-TU';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Waktu', 'Nama', 'Kelas', 'Nilai Total', 'Rincian Jawaban']);
    }

    const detail = d.details || [];
    let rincian = 'Status: ' + (d.status || '-') + '\n\n';
    rincian += detail.map(function(x, i) {
      return 'Soal ' + (x.no || (i + 1)) + ' [' + x.id + ']\n'
        + 'Pertanyaan: ' + (x.question || '-') + '\n'
        + 'Jawaban: ' + (x.userAnswer || '(tidak dijawab)') + '\n'
        + 'Bobot: ' + x.maxScore + ' | Skor: ' + x.score + ' / ' + x.maxScore + '\n'
        + 'Kata kunci: ' + (x.keywords || '-');
    }).join('\n\n');

    sheet.appendRow([
      d.timestamp,
      d.nama,
      d.kelas,
      d.finalScore,
      rincian
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}