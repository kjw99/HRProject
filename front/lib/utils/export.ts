/**
 * 데이터를 CSV 파일로 변환하여 다운로드합니다.
 * @param data - 다운로드할 객체 배열
 * @param headers - { [데이터키]: '엑셀헤더명' } (선택적으로 일부만 넘겨도 됨)
 * @param fileName - 저장될 파일 이름
 */
// 💡 Partial을 사용하여 모든 키를 다 넣지 않아도 되도록 수정!
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  headers: Partial<Record<keyof T, string>>,
  fileName: string,
) => {
  if (data.length === 0) {
    alert("다운로드할 데이터가 없습니다.");
    return;
  }

  // 💡 headers에 정의된 키들만 추출
  const headerKeys = Object.keys(headers) as (keyof T)[];
  const headerRow = headerKeys.map((key) => headers[key]).join(",");

  const dataRows = data.map((row) =>
    headerKeys
      .map((key) => {
        const cellValue = row[key] ?? "";
        const escaped = String(cellValue).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(","),
  );

  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${fileName}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
