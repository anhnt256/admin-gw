interface ElectronWindow extends Window {
  electron: {
    getMacAddresses: () => Promise<string[]>;
  }
}

declare global {
  interface Window {
    electron: ElectronWindow['electron']
  }
}

export const getMacAddresses = async (): Promise<string[]> => {
  if (typeof window !== 'undefined' && window.electron) {
    return await window.electron.getMacAddresses();
  }
  return [];
};
