export default function Navbar() {
  return (
    <nav className="absolute top-0 z-20 flex w-full items-center justify-between px-6 py-5 text-white md:px-12">
      <a href="/" className="text-xl font-bold">
        iThoddoo Maldives
      </a>

      <div className="hidden gap-6 text-sm font-medium md:flex">
        <a href="/">Home</a>
        <a href="/stay">Stay</a>
        <a href="/experiences">Experiences</a>
        <a href="/transfer">Transfer</a>
        <a href="/gallery">Gallery</a>
        <a href="/guide">Travel Guide</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  );
}