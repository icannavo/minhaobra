import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface FormData {
  type: string;
  items: {
    epis: string[];
    tools: string[];
    materials: string[];
    equipment: string[];
  };
  rooms: any[];
  name: string;
  location: string;
  employees: number;
  startDate: string;
  workDays: string[];
}

interface UseWorkDraftAutoSaveOptions {
  formData: FormData;
  currentStep: number;
  enabled?: boolean;
  onRestored?: (data: { formData: FormData; currentStep: number }) => void;
}

/**
 * Hook para auto-save de rascunhos da criação de obra
 * - Salva automaticamente a cada mudança (com debounce)
 * - Restaura rascunho automaticamente ao abrir a página
 * - Permite descartar rascunho
 */
export function useWorkDraftAutoSave({
  formData,
  currentStep,
  enabled = true,
  onRestored,
}: UseWorkDraftAutoSaveOptions) {
  const debouncedFormData = useDebounce(formData, 1000); // 1 segundo de debounce
  const debouncedStep = useDebounce(currentStep, 500);
  const draftIdRef = useRef<number | null>(null);
  const isRestoringRef = useRef(false);
  const hasShownToastRef = useRef(false);

  // Mutations
  const createDraftMutation = trpc.workDrafts.create.useMutation();
  const updateDraftMutation = trpc.workDrafts.update.useMutation();
  const deleteDraftMutation = trpc.workDrafts.delete.useMutation();

  // Query para buscar rascunho existente
  const { data: existingDraft, isLoading } = trpc.workDrafts.getLatest.useQuery(
    undefined,
    {
      enabled: enabled && !isRestoringRef.current,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 0,
    }
  );

  // Restaurar rascunho existente (apenas uma vez)
  useEffect(() => {
    if (existingDraft && !isRestoringRef.current && onRestored) {
      try {
        const parsedFormData = JSON.parse(existingDraft.formData);
        isRestoringRef.current = true;
        draftIdRef.current = existingDraft.id;
        
        onRestored({
          formData: parsedFormData,
          currentStep: existingDraft.currentStep,
        });

        if (!hasShownToastRef.current) {
          toast.info('Rascunho restaurado', {
            description: `Continuando da etapa ${existingDraft.currentStep}`,
          });
          hasShownToastRef.current = true;
        }
      } catch (error) {
        console.error('Erro ao restaurar rascunho:', error);
        toast.error('Erro ao restaurar rascunho');
      }
    }
  }, [existingDraft, onRestored]);

  // Auto-save quando dados mudarem
  useEffect(() => {
    if (!enabled || isRestoringRef.current || isLoading) return;

    // Só salvar se houver dados significativos
    const hasData = 
      debouncedFormData.type ||
      debouncedFormData.rooms.length > 0 ||
      debouncedFormData.name ||
      debouncedFormData.location;

    if (!hasData) return;

    const saveData = {
      formData: JSON.stringify(debouncedFormData),
      currentStep: debouncedStep,
    };

    if (draftIdRef.current) {
      // Atualizar rascunho existente
      updateDraftMutation.mutate({
        id: draftIdRef.current,
        ...saveData,
      });
    } else {
      // Criar novo rascunho
      createDraftMutation.mutate(saveData, {
        onSuccess: (data) => {
          draftIdRef.current = data.id;
        },
      });
    }
  }, [debouncedFormData, debouncedStep, enabled, isLoading]);

  // Função para descartar rascunho
  const discardDraft = useCallback(() => {
    if (draftIdRef.current) {
      deleteDraftMutation.mutate(draftIdRef.current, {
        onSuccess: () => {
          draftIdRef.current = null;
          toast.success('Rascunho descartado');
        },
      });
    }
  }, [deleteDraftMutation]);

  // Função para marcar rascunho como completo
  const completeDraft = useCallback(() => {
    if (draftIdRef.current) {
      updateDraftMutation.mutate({
        id: draftIdRef.current,
        status: 'completed',
      });
      draftIdRef.current = null;
    }
  }, [updateDraftMutation]);

  return {
    isLoading,
    isSaving: createDraftMutation.isPending || updateDraftMutation.isPending,
    hasExistingDraft: !!existingDraft,
    discardDraft,
    completeDraft,
  };
}
