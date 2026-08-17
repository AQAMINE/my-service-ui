export interface Category {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
}
