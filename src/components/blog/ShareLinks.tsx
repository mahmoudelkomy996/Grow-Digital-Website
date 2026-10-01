import { CopyLinkButton } from "./CopyLinkButton";

/** Share the article: plain links (no third-party scripts) plus copy-to-clipboard. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="eyebrow text-teal-600">Share</p>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-small text-teal-900 transition-colors hover:border-teal-900/40"
            >
              {l.label}
              {l.label !== "Email" ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} />
        </li>
      </ul>
    </div>
  );
}
