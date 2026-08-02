import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import BrochureModal from "@/components/site/BrochureModal";

const BrochureModalContext = createContext({ open: () => {} });

export function BrochureModalProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, slug: null, packageName: "" });

  const open = useCallback((slug, packageName = "") => {
    setState({ isOpen: true, slug, packageName });
  }, []);

  const close = useCallback(() => setState((s) => ({ ...s, isOpen: false })), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <BrochureModalContext.Provider value={value}>
      {children}
      <BrochureModal
        isOpen={state.isOpen}
        onClose={close}
        slug={state.slug}
        packageName={state.packageName}
      />
    </BrochureModalContext.Provider>
  );
}

export function useBrochureModal() {
  return useContext(BrochureModalContext);
}
