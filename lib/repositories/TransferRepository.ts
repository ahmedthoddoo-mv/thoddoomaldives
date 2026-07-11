import { transfers } from "@/data/transfers";
import { createRepository } from "@/lib/repositories/types";

export const TransferRepository = {
  ...createRepository({
    records: transfers,
    searchFields: ["id", "slug", "title", "type", "description", "duration", "price", "departurePoint", "arrivalPoint"]
  }),
  findVerified() {
    return transfers.filter((transfer) => transfer.featured);
  }
};
