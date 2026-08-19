// useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard'];

export function useDashboard() {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 1000 * 30, // refresh every 30s
  });

  return {
    ...query,
    dashboard: query.data,
  };
}
