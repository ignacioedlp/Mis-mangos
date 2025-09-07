"use client"

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const toastMessage = searchParams.get("toast");
    const toastType = searchParams.get("type");

    if (toastMessage) {
      if (toastType === "success") {
        toast.success(toastMessage);
      } else if (toastType === "error") {
        toast.error(toastMessage);
      } else {
        toast(toastMessage);
      }

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      url.searchParams.delete("type");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
