export function SiteFooter() {
  return (
    <footer
      className="flex flex-col gap-2 text-[0.85rem] leading-[1.7] opacity-75"
      id="contact"
    >
      <p>
        © NIR | Blog — Reach out via{" "}
        <a
          className="underline decoration-[1px] underline-offset-2"
          href="mailto:hello@nir.rip"
        >
          hello@nir.rip
        </a>
      </p>
      <p>
        Links:{" "}
        <a
          className="underline decoration-[1px] underline-offset-2"
          href="https://github.com/nir659"
        >
          Github
        </a>
        ,{" "}
        <a
          className="underline decoration-[1px] underline-offset-2"
          href="https://github.com/nir659/blog"
        >
          Source Code
        </a>
        ,{" "}
        <a
          className="underline decoration-[1px] underline-offset-2"
          href="https://t.me/nir659"
        >
          Telegram
        </a>
      </p>
    </footer>
  );
}
