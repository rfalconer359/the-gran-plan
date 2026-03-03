export const ADMIN_UID = '7rbCfuTu5JSdL5QnL42acMg5Lwe2';

export function isAdmin(uid: string | undefined): boolean {
  return uid === ADMIN_UID;
}
