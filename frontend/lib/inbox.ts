export type InboxAttachment = {
  id: string;
  name: string;
  size: string;
  url?: string;
  downloadEndpoint?: string;
  contentType?: string;
};

export type InboxReport = {
  id: string;
  backendId?: string;
  status?: "pending" | "accept" | "comment";
  archived?: boolean;
  reviewedAt?: string;
  sender: string;
  senderAvatar?: string;
  title: string;
  category: "خوانده شده" | "خوانده نشده";
  hasAttachment: boolean;
  createdAt: number;
  date: string;
  time: string;
  content?: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachments?: InboxAttachment[];
  commentText?: string;
};
