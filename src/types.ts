export interface Post {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  date: string;
  featured: boolean;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  reply?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  text: string;
  date: string;
  reply?: string;
}
