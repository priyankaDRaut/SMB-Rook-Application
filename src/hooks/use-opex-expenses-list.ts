import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { makeApiRequest, API_CONFIG } from '@/lib/api-config';

export interface OpexExpensesListFilters {
  locationId: string;
  fromDate: number;
  toDate: number;
  page?: number;
  size?: number;
}

export interface OpexExpensesListResult {
  rows: Record<string, unknown>[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  raw: unknown;
}

function normalizeOpexExpensesResponse(raw: unknown): OpexExpensesListResult {
  const r = raw as Record<string, unknown> | null | undefined;
  const inner = (r?.data ?? r) as Record<string, unknown> | undefined;

  const pickRows = (): Record<string, unknown>[] => {
    const fromContent = inner?.content ?? r?.content;
    if (Array.isArray(fromContent)) {
      return fromContent.map((row) =>
        row && typeof row === 'object' && !Array.isArray(row)
          ? (row as Record<string, unknown>)
          : { value: row as unknown }
      );
    }
    const dataList = inner?.dataList ?? r?.dataList;
    if (Array.isArray(dataList)) {
      return dataList.map((row) =>
        row && typeof row === 'object' && !Array.isArray(row)
          ? (row as Record<string, unknown>)
          : { value: row as unknown }
      );
    }
    const dataArr = inner?.data ?? r?.data;
    if (Array.isArray(dataArr)) {
      return dataArr.map((row) =>
        row && typeof row === 'object' && !Array.isArray(row)
          ? (row as Record<string, unknown>)
          : { value: row as unknown }
      );
    }
    return [];
  };

  const rows = pickRows();
  const size = Number(inner?.size ?? r?.size ?? 10) || 10;
  const page = Number(inner?.number ?? r?.page ?? r?.number ?? 0) || 0;
  const totalElements = Number(
    inner?.totalElements ?? r?.totalElements ?? rows.length
  );
  const totalPages = Math.max(
    1,
    Number(inner?.totalPages ?? r?.totalPages) ||
      Math.ceil(totalElements / size) ||
      1
  );

  return {
    rows,
    totalElements,
    totalPages,
    page,
    size,
    raw,
  };
}

const DEFAULT_ID = '';

export const useOpexExpensesList = (filters: Partial<OpexExpensesListFilters> & { enabled?: boolean }) => {
  const [result, setResult] = useState<OpexExpensesListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const locationId = filters.locationId || DEFAULT_ID;
  const fromDate = filters.fromDate ?? 0;
  const toDate = filters.toDate ?? 0;
  const page = filters.page ?? 0;
  const size = filters.size ?? 10;
  const enabled = filters.enabled !== false;

  useEffect(() => {
    const fetchData = async () => {
      if (!enabled) {
        setLoading(false);
        return;
      }
      if (!accessToken) {
        setError('No access token available. Please login again.');
        setLoading(false);
        return;
      }
      if (!locationId) {
        setError('No location id provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await makeApiRequest(
          API_CONFIG.ENDPOINTS.OPEX_EXPENSES_LIST,
          accessToken,
          {
            locationId,
            fromDate,
            toDate,
            page,
            size,
          }
        );
        setResult(normalizeOpexExpensesResponse(data));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch OPEX expenses list';
        setError(errorMessage);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, locationId, fromDate, toDate, page, size, enabled]);

  return { opexList: result, loading, error };
};
