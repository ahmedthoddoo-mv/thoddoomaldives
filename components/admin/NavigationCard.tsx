type NavigationCardProps = {
  title: string;
  value: string;
  description: string;
};

export function NavigationCard({ title, value, description }: NavigationCardProps) {
  return (
    <article className="adminNavigationCard">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}
