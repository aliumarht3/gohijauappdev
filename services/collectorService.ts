import api from '../api/apiClient';
import { getTransaction } from './transactionService';

/**
 * Proposed backend contract (for review):
 * GET /collector/collection-stats
 * Response: { collectionsTodayKg: number, collectedThisWeekKg: number }
 *
 * Alternate path tried: GET /user/collector-total-transaction
 */
export type CollectorCollectionStats = {
  collectionsTodayKg: number;
  collectedThisWeekKg: number;
};

type CollectorTransactionRow = {
  createdAt: string;
  oilCollected?: number;
  oilPoured?: number;
};

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Calendar week starting Monday (local time). */
function startOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function aggregateFromTransactions(rows: CollectorTransactionRow[]): CollectorCollectionStats {
  const todayStart = startOfToday();
  const weekStart = startOfWeek();
  let collectionsTodayKg = 0;
  let collectedThisWeekKg = 0;

  for (const row of rows) {
    const at = new Date(row.createdAt);
    if (isNaN(at.getTime())) continue;
    const kg = Number(row.oilCollected ?? row.oilPoured ?? 0);
    if (at >= todayStart) collectionsTodayKg += kg;
    if (at >= weekStart) collectedThisWeekKg += kg;
  }

  return { collectionsTodayKg, collectedThisWeekKg };
}

async function fetchFromDedicatedEndpoint(): Promise<CollectorCollectionStats | null> {
  const paths = ['/collector/collection-stats', '/user/collector-total-transaction'];

  for (const path of paths) {
    try {
      const result = await api.get(path);
      const data = result.data?.data ?? result.data;
      if (
        data &&
        typeof data.collectionsTodayKg === 'number' &&
        typeof data.collectedThisWeekKg === 'number'
      ) {
        return {
          collectionsTodayKg: data.collectionsTodayKg,
          collectedThisWeekKg: data.collectedThisWeekKg,
        };
      }
      if (
        data &&
        typeof data.totalOilCollectedToday === 'number' &&
        typeof data.totalOilCollectedWeek === 'number'
      ) {
        return {
          collectionsTodayKg: data.totalOilCollectedToday,
          collectedThisWeekKg: data.totalOilCollectedWeek,
        };
      }
    } catch {
      // try next path
    }
  }
  return null;
}

async function fetchFromTransactionHistory(): Promise<CollectorCollectionStats> {
  const result = await getTransaction();
  const rows = Array.isArray(result) ? (result as CollectorTransactionRow[]) : [];
  return aggregateFromTransactions(rows);
}

export async function getCollectorCollectionStats(): Promise<CollectorCollectionStats> {
  const fromApi = await fetchFromDedicatedEndpoint();
  if (fromApi) return fromApi;
  return fetchFromTransactionHistory();
}
