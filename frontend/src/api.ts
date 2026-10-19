import type { HealthResponse, ImportSummary, ResearchReport, StockDetail, StocksSearchResponse } from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Non-json response
    }
    throw new ApiError(errorDetail, res.status);
  }
  return res.json() as Promise<T>;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse<HealthResponse>(res);
}

export async function searchStocks(
  query: string = '',
  exchange?: string,
  page: number = 1,
  limit: number = 18
): Promise<StocksSearchResponse> {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set('q', query.trim());
  }
  if (exchange && exchange.trim()) {
    params.set('exchange', exchange.trim());
  }
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/stocks?${params.toString()}`);
  return handleResponse<StocksSearchResponse>(res);
}

export async function getStockDetail(symbol: string, exchange?: string): Promise<StockDetail> {
  const params = new URLSearchParams();
  if (exchange && exchange.trim()) {
    params.set('exchange', exchange.trim());
  }
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/stocks/${encodeURIComponent(symbol)}${queryStr}`);
  return handleResponse<StockDetail>(res);
}

export async function generateReport(symbol: string, exchange?: string): Promise<ResearchReport> {
  const params = new URLSearchParams();
  if (exchange && exchange.trim()) {
    params.set('exchange', exchange.trim());
  }
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(symbol)}${queryStr}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<ResearchReport>(res);
}

export async function uploadCatalogFile(exchange: 'NSE' | 'BSE', file: File): Promise<ImportSummary> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/catalog/import?exchange=${exchange}`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<ImportSummary>(res);
}
