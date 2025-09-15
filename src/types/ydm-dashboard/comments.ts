export interface OrderComment {
  id: number;
  order: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  comment: string;
  created_at: string;
}

export interface CreateOrderCommentRequest {
  order: number;
  comment: string;
}

export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}
