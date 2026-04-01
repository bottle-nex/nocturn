export interface CustomResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: string;
  };
  url?: string;
  meta: {
    timestamp: string;
    [key: string]: unknown;
  };
}
