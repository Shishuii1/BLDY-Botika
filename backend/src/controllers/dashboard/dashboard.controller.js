import { query } from '../../config/db.js';
import { success } from '../../utils/helpers.js';
import { logger } from '../../utils/logger.js';
import * as inventoryService from '../../services/inventory.service.js';
import * as aiForecast from '../../services/aiForecast.service.js';

const emptyStats = {
  revenue: 0,
  transactions: 0,
};

export async function stats(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

    const dailyRows = await query(
      `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as transactions
       FROM sales WHERE status='completed' AND DATE(created_at)=?`,
      [today]
    );
    const weeklyRows = await query(
      `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as transactions
       FROM sales WHERE status='completed' AND DATE(created_at) BETWEEN ? AND ?`,
      [weekAgo, today]
    );
    const monthlyRows = await query(
      `SELECT COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as transactions
       FROM sales WHERE status='completed' AND DATE(created_at) >= ?`,
      [monthStart]
    );

    const chartData = await query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as revenue
       FROM sales WHERE status='completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    );

    const topSelling = await query(
      `SELECT m.medicine_name, SUM(si.quantity) as qty FROM sale_items si
       JOIN sales s ON si.sale_id = s.sale_id JOIN medicines m ON si.medicine_id = m.medicine_id
       WHERE s.status='completed' AND DATE(s.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY m.medicine_id, m.medicine_name ORDER BY qty DESC LIMIT 5`
    );

    const recentSales = await query(
      `SELECT s.sale_id, s.invoice_number, s.total_amount, s.created_at, u.full_name as cashier
       FROM sales s LEFT JOIN users u ON s.user_id = u.user_id
       ORDER BY s.created_at DESC LIMIT 10`
    );

    const activeUsersRows = await query(
      'SELECT COUNT(*) as count FROM users WHERE is_active=1 AND last_login >= DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );

    let lowStock = [];
    let expiring = [];
    let forecast = { forecast: [], predictedMonthlyRevenue: 0 };

    try {
      lowStock = await inventoryService.getLowStock();
      expiring = await inventoryService.getExpiring(60);
      forecast = await aiForecast.forecastSales(14);
    } catch (e) {
      logger.warn('Dashboard inventory/forecast:', e.message);
    }

    return success(res, {
      daily: dailyRows[0] || emptyStats,
      weekly: weeklyRows[0] || emptyStats,
      monthly: monthlyRows[0] || emptyStats,
      chartData,
      topSelling,
      recentSales,
      activeUsers: activeUsersRows[0]?.count || 0,
      lowStock: lowStock.slice(0, 5),
      expiring: expiring.slice(0, 5),
      forecast,
    });
  } catch (err) {
    logger.error('Dashboard stats error:', err.message);
    return success(res, {
      daily: emptyStats,
      weekly: emptyStats,
      monthly: emptyStats,
      chartData: [],
      topSelling: [],
      recentSales: [],
      activeUsers: 0,
      lowStock: [],
      expiring: [],
      forecast: { forecast: [], predictedMonthlyRevenue: 0 },
      dbWarning: 'Database tables may be missing. Run database/schema/pharma_sys.sql',
    });
  }
}
