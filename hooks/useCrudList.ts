"use client";

import { useCallback, useState } from "react";

type UseCrudListOptions<T extends { id: string }> = {
  initial: T[];
};

export function useCrudList<T extends { id: string }>({
  initial,
}: UseCrudListOptions<T>) {
  const [items, setItems] = useState<T[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setEditingId(null);
    setShowForm(false);
  }, []);

  const create = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
    closeForm();
  }, [closeForm]);

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
      closeForm();
    },
    [closeForm],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  return {
    items,
    setItems,
    showForm,
    editingId,
    openCreate,
    openEdit,
    closeForm,
    create,
    update,
    remove,
    getById,
  };
}
