// useWallets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import {
  WalletFilter,
  CreateWalletPayload,
  UpdateWalletPayload,
  TransferWalletPayload,
} from '../types/wallet';

export const WALLETS_QUERY_KEY = ['wallets'];

export function useWallets(filters?: WalletFilter) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...WALLETS_QUERY_KEY, filters],
    queryFn: () => walletService.getWallets(filters),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateWalletPayload) => walletService.createWallet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWalletPayload }) =>
      walletService.updateWallet(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => walletService.deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: (payload: TransferWalletPayload) => walletService.transfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => walletService.archiveWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => walletService.restoreWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    wallets: query.data?.wallets || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    totalPages: query.data?.totalPages || 1,
    createWallet: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWallet: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWallet: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    transferWallet: transferMutation.mutateAsync,
    isTransferring: transferMutation.isPending,
    archiveWallet: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    restoreWallet: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
