// Bu dosyayı elle düzenleyerek email içeriğini ve tasarımını değiştirebilirsin.
// Değişiklik yapmak için yalnızca aşağıdaki HTML string'ini güncelle.
interface ResetPasswordData { resetLink: string; appName?: string; }

// Parola sıfırlama HTML'ini callback aracılığıyla teslim eder.
export function renderResetPasswordTemplate(data: ResetPasswordData, callback: (html: string) => void): void {
  const appName = data.appName ?? 'Zyqwax ID';
  const html = `
    <div style="background-color:#0e0e11;color:#f4f4f2;font-family:Arial,sans-serif;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;">
        <h1 style="font-size:24px;font-weight:600;margin:0 0 20px;">${appName}</h1>
        <p style="font-size:16px;line-height:1.6;">Parolanı sıfırlamak için aşağıdaki butona tıkla.</p>
        <a href="${data.resetLink}" style="background-color:#f4f4f2;color:#131316;display:inline-block;padding:12px 18px;text-decoration:none;font-weight:600;margin:12px 0 24px;">Parolayı sıfırla</a>
        <p style="font-size:13px;line-height:1.6;color:#b8b8ba;">Buton çalışmazsa şu linki kopyala:</p>
        <p style="font-size:13px;line-height:1.6;word-break:break-all;color:#f4f4f2;">${data.resetLink}</p>
        <p style="font-size:13px;color:#8f8f92;margin-top:28px;">Bu link 1 saat geçerlidir.</p>
      </div>
    </div>`;
  callback(html);
}
