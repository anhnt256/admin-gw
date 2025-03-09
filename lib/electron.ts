// @ts-nocheck
export const isElectron = () => {
  return typeof window !== "undefined" && window.electron !== undefined;
};
