export const toNumber = (value) => Number(value || 0);

export const calculateSummaryStats = (actualRows = [], insights = null) => {
  if (!actualRows.length) {
    return {
      totalConsumption: 0,
      averageConsumption: 0,
      peakMonth: '--',
      lowestMonth: '--',
      totalBill: 0,
      avgRate: 0
    };
  }

  const consumptionValues = actualRows.map((row) => toNumber(row.consumption));
  const billValues = actualRows.map((row) => toNumber(row.bill));
  const totalConsumption = consumptionValues.reduce((sum, item) => sum + item, 0);
  const totalBill = billValues.reduce((sum, item) => sum + item, 0);

  const peakIndex = consumptionValues.indexOf(Math.max(...consumptionValues));
  const lowIndex = consumptionValues.indexOf(Math.min(...consumptionValues));

  return {
    totalConsumption,
    averageConsumption: totalConsumption / actualRows.length,
    peakMonth: insights?.peak_month || actualRows[peakIndex]?.month || '--',
    lowestMonth: insights?.lowest_month || actualRows[lowIndex]?.month || '--',
    totalBill,
    avgRate: insights?.avg_rate_per_kwh || (totalConsumption ? totalBill / totalConsumption : 0)
  };
};

export const downloadCsv = (filename, rows, headers) => {
  const csvRows = [headers.join(','), ...rows.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
