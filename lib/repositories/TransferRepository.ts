import { transfers } from "@/data/transfers";
import { createRepository } from "@/lib/repositories/types";

export const TransferRepository = {
  ...createRepository({
    records: transfers,
    searchFields: [
      "id",
      "slug",
      "title",
      "operatorName",
      "route",
      "type",
      "description",
      "duration",
      "price",
      "departurePoint",
      "arrivalPoint",
    ],
  }),
  findPublished() {
    return transfers.filter((transfer) => transfer.isPublished && transfer.verificationStatus === "verified");
  },
  findVerified() {
    return transfers.filter((transfer) => transfer.verificationStatus === "verified");
  },
};
