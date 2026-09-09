import {
  useMutation,
  type MutationFunction,
  type MutationKey,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

export type UseApiMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn"
> & {
  mutationFn: MutationFunction<TData, TVariables>;
  mutationKey?: MutationKey;
};

/**
 * Hook genérico para mutaciones de API con TanStack Query.
 *
 * No contiene lógica específica del backend ni de una feature.
 * Las features definen su propio mutationFn y, si lo necesitan,
 * sus callbacks de éxito, error o actualización de caché.
 */
export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseApiMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation(options);
}
