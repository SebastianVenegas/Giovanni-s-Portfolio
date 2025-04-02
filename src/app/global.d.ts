// Global type definitions for the app
declare module 'queue-microtask' {
  const queueMicrotask: (callback: () => void) => void;
  export default queueMicrotask;
}

declare module 'fast-fifo' {
  export class FIFO<T> {
    constructor();
    push(value: T): void;
    shift(): T | undefined;
    isEmpty(): boolean;
    clear(): void;
  }
}

// Ensure types for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ADMIN_PASSWORD?: string;
  }
} 