import SearchEmptyState from "@/components/search/SearchEmptyState";

export default function SearchResults<T>({
  results,
  renderItem,
  emptyTitle,
  emptyDescription,
}: {
  results: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (results.length === 0) {
    return (
      <SearchEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {results.map(renderItem)}
    </div>
  );
}
