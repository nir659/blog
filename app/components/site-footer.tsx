type SiteFooterProps = {
  className?: string;
};

function FooterContent() {
  return (
    <div className="max-w-auto">
      <p className="text-[0.85rem] uppercase tracking-[0.18em] opacity-80">
        Links
      </p>
      <ul className="flex flex-col gap-1 mt-2 max-w-auto">
        <li>
          <a
            className="underline decoration-[1px] underline-offset-2"
            href="https://github.com/nir659/blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source Code
          </a>
        </li>
        <li>
          <a
            className="underline decoration-[1px] underline-offset-2"
            href="https://matrix.to/#/@nir:matrix.nir.rip"
            target="_blank"
            rel="noopener noreferrer"
          >
            Matrix
          </a>
        </li>
        <li>
          <a
            className="underline decoration-[1px] underline-offset-2"
            href="https://nir.rip/GAhbMNZYJv.txt"
            target="_blank"
            rel="noopener noreferrer"
          >
            PGP Key
          </a>
        </li>
        <li>
          <a
            className="underline decoration-[1px] underline-offset-2"
            href="https://discord.com/users/832277464415338566"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
        </li>
      </ul>
      <p className="text-[0.85rem] uppercase tracking-[0.18em] opacity-80 mt-2">
        NIR© {new Date().getFullYear()} |{" "}
        <a
          className="underline decoration-[1px] underline-offset-2"
          href="mailto:nir@nir.rip"
        >
          Mail
        </a>
      </p>
    </div>
  );
}

export function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`flex flex-col text-[1.1rem] leading-[2.2] opacity-75 text-right mt-auto pt-8 ${className}`}
      id="contact"
    >
      <FooterContent />
    </footer>
  );
}

export function MobileFooter() {
  return (
    <footer
      className="md:hidden flex flex-col text-[1.1rem] leading-[2.2] opacity-75 text-center py-8 mt-8 border-t border-[var(--grid-lines)]"
      id="contact-mobile"
    >
      <FooterContent />
    </footer>
  );
}
