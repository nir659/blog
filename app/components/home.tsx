type NavLink = {
  href: string;
  label: string;
};

type MainProps = {
  navLinks: NavLink[];
};

const LineClass =
  "block h-px w-[calc(100%+8rem)] self-center bg-[var(--grid-lines)]";

export function Main({ navLinks }: MainProps) {
  return (
    <header className="relative flex flex-col" id="about">
      <div className="flex flex-col gap-2">
        <span aria-hidden="true" className={LineClass} />
        <p className="tracking-[0.24em] text-[0.75rem] uppercase text-right self-end">
          A JOURNAL OF EXPERIMENTS
        </p>
        <span aria-hidden="true" className={LineClass} />
      </div>
      <div className="mt-3 mb-3 flex items-end gap-4">
        <h1 className="text-[clamp(2.4rem,5vw,3.4rem)] leading-[1.1] m-0">
          NIR | Blog
        </h1>
      </div>
      <nav className="mb-6 flex flex-wrap gap-6">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[0.85rem] uppercase tracking-[0.18em] opacity-70 transition-opacity duration-150 hover:opacity-100"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <span aria-hidden="true" className={LineClass} />
    </header>
  );
}
