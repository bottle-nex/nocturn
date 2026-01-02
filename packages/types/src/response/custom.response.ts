export interface CustomResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: string;
  };
  meta: {
    timestamp: string;
    [key: string]: unknown;
  };
}
