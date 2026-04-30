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
