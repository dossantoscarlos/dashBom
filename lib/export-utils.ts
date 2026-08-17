/**
 * Utilitários para Exportação Real de Dados em CSV, Excel e PDF na Plataforma
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(";"),
    ...rows.map((row) =>
      row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(";")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Relatório</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #06284F; color: #ffffff; font-weight: bold; text-align: left; padding: 6px; }
          td { border: 1px solid #cccccc; padding: 6px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr>${r.map((val) => `<td>${val ?? ""}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePrintablePDF(title: string, headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${title} — Relatório Oficial</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #10213D; }
          .header { border-bottom: 2px solid #1264F3; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; color: #06284F; }
          .header p { margin: 5px 0 0 0; font-size: 11px; color: #64748B; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background-color: #06284F; color: #ffffff; text-align: left; padding: 8px; font-weight: bold; }
          td { border-bottom: 1px solid #E2E8F0; padding: 8px; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          .footer { margin-top: 30px; font-size: 10px; color: #94A3B8; text-align: right; border-top: 1px solid #E2E8F0; padding-top: 10px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Relatório Gerado Oficialmente em ${new Date().toLocaleString("pt-BR")} — Sistema de Gestão Política & Eleitoral</p>
        </div>

        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr>${r.map((val) => `<td>${val ?? "-"}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          Documento impresso/gerado em PDF via Sistema de Gestão Eleitoral • ${new Date().toLocaleDateString("pt-BR")}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
