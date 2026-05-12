export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  statusCode: number;
  message: string;
  title: string | null;
  errorMessages: string[];
}