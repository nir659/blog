import { Main } from "@/app/components/home";
import { PostListSection } from "@/app/components/post-list";
import { SiteFooter } from "@/app/components/site-footer";
import { Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#archive", label: "Archive" },
  { href: "#contact", label: "Contact" },
];

const posts = [
  {
    href: "/ctf",
    title: "CTF: ",
    excerpt: "Notes on CTF challenges and how to solve them.",
  },
  {
    href: "/dev",
    title: "Development: ",
    excerpt: "Notes on development and how to solve them.",
  },
  {
    href: "/security",
    title: "Security: ",
    excerpt: "Notes on security and how to secure systems.",
  },
  {
    href: "/other",
    title: "Other: ",
    excerpt: "other stuff",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${spaceMono.className} flex min-h-screen justify-center px-4 sm:px-6`}
    >
      {/* To increase the overall width, you can raise the max-w value here from max-w-[1200px] to a higher value such as max-w-[1400px] */}
      <div className="grid w-full max-w-[2000px] grid-cols-1 md:grid-cols-[minmax(3rem,1fr)_1px_minmax(0,1800px)_1px_minmax(3rem,1fr)] md:gap-x-[clamp(2rem,6vw,4rem)]">
        {/* If you want to make the content column wider, increase the 820px in minmax(0,820px) above */}
        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-2 md:block"
        />
        <section className="col-start-1 flex flex-col gap-[clamp(2rem,6vw,3.5rem)] py-[clamp(3rem,8vw,2rem)] md:col-start-3">
          <Main navLinks={navLinks} />
          <PostListSection posts={posts} />
          <SiteFooter />
        </section>
        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-4 md:block"
        />
      </div>
    </main>
  );
}
