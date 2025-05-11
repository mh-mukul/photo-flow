export type Photo = {
  id: string;
  src: string;
  alt?: string | null;
  description?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};
