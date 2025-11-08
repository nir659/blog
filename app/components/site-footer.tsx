export function SiteFooter() {
  return (
    <footer
      className="fixed bottom-0 right-0 flex flex-col text-[1.1rem] leading-[2.2] opacity-75 m-6 pl-6 text-right"
      id="contact"
    >
      <div className="max-w-auto">
        <p className="text-[0.85rem] uppercase tracking-[0.18em] opacity-80">Links</p>
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
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
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
            href="mailto:hello@nir.rip"
          >
            Mail
          </a>
        </p>
      </div>
    </footer>
  );
}
