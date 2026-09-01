export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  dateKey: string;
};

export type CommentsTodayResponse = {
  success: true;
  dateKey: string;
  count: number;
  comments: Comment[];
};

export type StatsTodayResponse = {
  dateKey: string;
  count: number;
};

export type PostCommentSuccess = {
  success: true;
  comment: Comment;
};

export type PostCommentFailure = {
  success: false;
  error: string;
};

export type PostCommentResponse = PostCommentSuccess | PostCommentFailure;

export type PatchCommentSuccess = {
  success: true;
  comment: Comment;
};

export type PatchCommentFailure = {
  success: false;
  error: string;
};

export type PatchCommentResponse = PatchCommentSuccess | PatchCommentFailure;
