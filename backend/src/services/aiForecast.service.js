import { query } from '../config/db.js';

export async function forecastSales(days = 30) {
  const history = await query(
    `SELECT DATE(created_at) as date, SUM(total_amount) as revenue
     FROM sales WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
     GROUP BY DATE(created_at) ORDER BY date`
  );

  if (!history.length) {
    return { forecast: [], message: 'Insufficient sales history', predictedRevenue: 0 };
  }

  const avgDaily = history.reduce((s, r) => s + Number(r.revenue), 0) / history.length;
  const forecast = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const trend = 1 + (i * 0.002);
    forecast.push({
      date: d.toISOString().slice(0, 10),
      predictedRevenue: Math.round(avgDaily * trend * 100) / 100,
    });
  }

  return {
    forecast,
    averageDailyRevenue: Math.round(avgDaily * 100) / 100,
    predictedMonthlyRevenue: Math.round(avgDaily * 30 * 100) / 100,
    confidence: history.length > 14 ? 'medium' : 'low',
  };
}
