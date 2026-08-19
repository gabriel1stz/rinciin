// useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';
import {
  TransactionFilter,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from '../types/transaction';
import { WALLETS_QUERY_KEY } from './useWallets';
import { BUDGETS_QUERY_KEY } from './useBudgets';

export const TRANSACTIONS_QUERY_KEY = ['transactions'];

export function useTransactions(filters?: TransactionFilter) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => transactionService.getTransactions(filters),
  });

  const invalidateAllRelated = () => {
    queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionService.createTransaction(payload),
    onSuccess: invalidateAllRelated,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      transactionService.updateTransaction(id, payload),
    onSuccess: invalidateAllRelated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: invalidateAllRelated,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => transactionService.restoreTransaction(id),
    onSuccess: invalidateAllRelated,
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      transactionService.uploadReceipt(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });

  return {
    ...query,
    transactions: query.data?.data || [],
    pagination: query.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTransaction: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    restoreTransaction: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    uploadReceipt: uploadReceiptMutation.mutateAsync,
    isUploadingReceipt: uploadReceiptMutation.isPending,
  };
}
