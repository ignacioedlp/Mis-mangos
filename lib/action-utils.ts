"use server"

import { redirect } from "next/navigation";

export async function withToast<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  successMessage?: string,
  redirectPath?: string
) {
  return async (...args: T): Promise<R | never> => {
    try {
      const result = await action(...args);
      
      if (successMessage && redirectPath) {
        redirect(`${redirectPath}?toast=${encodeURIComponent(successMessage)}&type=success`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      
      if (redirectPath) {
        redirect(`${redirectPath}?toast=${encodeURIComponent(errorMessage)}&type=error`);
      }
      
      throw error;
    }
  };
}
