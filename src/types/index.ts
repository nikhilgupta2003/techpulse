export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin';
  bio?: string;
  createdAt: any;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  category: string;
  subcategory: string;
  createdAt: any;
  updatedAt: any;
  likesCount: number;
  viewsCount: number;
}

export interface Comment {
  id: string;
  blogId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  content: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
}
