import { useState, useCallback } from 'react';

function useDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const onOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return [open, onOpenChange, setOpen] as const;
}

export default useDialogState;
