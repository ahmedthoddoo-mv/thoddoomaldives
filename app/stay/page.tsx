import BookButton from "@/components/BookButton";

export default function StayPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Stay in Thoddoo</h1>

      <div className="mt-6 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Ocean View Guesthouse</h2>
        <p className="mt-2 text-gray-600">
          Comfortable guesthouse stay in Thoddoo, Maldives.
        </p>

        <div className="mt-4">
          <BookButton phone="9609910136" name="Ocean View Guesthouse" />
        </div>
      </div>
    </main>
  );
}