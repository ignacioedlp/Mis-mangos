import {
  listWishlistItems,
  listWishlistSubcategories,
} from "@/actions/wishlist-actions";
import { getCryptoDollarRate } from "@/lib/crypto-dollar-server";
import { WishlistManager } from "@/components/wishlist-manager";

export default async function WishlistPage() {
  const [{ items, summary }, subcategories, cryptoDollarRate] = await Promise.all([
    listWishlistItems(),
    listWishlistSubcategories(),
    getCryptoDollarRate(),
  ]);

  return (
    <WishlistManager
      initialItems={items}
      summary={summary}
      subcategories={subcategories}
      cryptoDollarRate={cryptoDollarRate}
    />
  );
}
