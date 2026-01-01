export interface CustomResponse<T = undefined> {
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
