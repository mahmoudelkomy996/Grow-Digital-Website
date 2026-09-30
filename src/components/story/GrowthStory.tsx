// PLACEHOLDER — replaced by the 3D growth story (plan Task 5). Same export, same section ids.
import { STORY } from "@/content/story";
import { accent } from "@/lib/accent";

export function GrowthStory() {
  const intro = STORY[0];
  return (
    <section id="story" aria-label="The growth story" className="surface-dark relative flex min-h-dvh items-center bg-stage text-teal-100">
      <div className="container-site">
        <p className="eyebrow text-lime">{intro.full}</p>
        <h1 className="mt-5 max-w-3xl text-display text-paper">{accent(intro.title, "text-mint")}</h1>
        <p className="mt-6 max-w-xl text-body-l text-teal-200">{intro.lead}</p>
        <a href="#integrator" className="eyebrow mt-10 inline-block text-teal-300 underline-offset-4 hover:underline">Skip the story</a>
      </div>
    </section>
  );
}
