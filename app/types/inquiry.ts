export type InquiryInput = {
  userEmail: string;
  userName: string | null;
  subject: string;
  message: string;
};

export type InquiryResult = {
  success: boolean;
  error?: string;
};

export type InquiryRow = {
  id: string;
  user_email: string;
  user_name: string | null;
  subject: string;
  message: string;
  status: "pending" | "replied";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export type InquiryListResult = {
  success: boolean;
  data?: InquiryRow[];
  error?: string;
};

export type ReplyInquiryInput = {
  id: string;
  adminReply: string;
};
