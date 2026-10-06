export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export interface ApiErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}
