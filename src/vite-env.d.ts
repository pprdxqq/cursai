interface CursaiAPI {
  window: { toggle(): Promise<boolean>; show(): Promise<boolean>; hide(): Promise<boolean> };
  screen: {
    sources(): Promise<Array<{ id: string; name: string; thumbnail: string }>>;
    display(): Promise<{ cursor: { x: number; y: number }; bounds: object; workArea: object; scaleFactor: number }>;
  };
  system: { open(url: string): Promise<boolean>; cwd(): Promise<string> };
  ai: { ask(payload: { message: string }): Promise<{ success: boolean; text?: string; error?: string }> };
}

declare global {
  interface Window { cursai: CursaiAPI }
}
export {};
