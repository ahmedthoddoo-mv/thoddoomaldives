export default function Button({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light" | "green" | "outline";
}) {
  const styles = {
    dark: "bg-slate-900 text-white",
    light: "bg-white text-slate-900",
    green: "bg-green-500 text-white",
    outline: "border border-white text-white",
  };

  return (
    <a
      href={href}
      className={`inline-block rounded-full px-6 py-3 font-semibold ${styles[variant]}`}
    >
      {children}
    </a>
  );
}