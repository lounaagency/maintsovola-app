import React from 'react';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

interface AsyncWrapperProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  children: (data: T) => React.ReactNode;
}

export default function AsyncWrapper<T>({
  data,
  loading,
  error,
  onRetry,
  loadingMessage,
  emptyMessage,
  emptyDescription,
  children,
}: AsyncWrapperProps<T>) {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!data) {
    return (
      <EmptyState 
        message={emptyMessage} 
        description={emptyDescription}
      />
    );
  }

  return <>{children(data)}</>;
}