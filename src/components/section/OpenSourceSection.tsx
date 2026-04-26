export function OpenSourceSection() {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <h2
        id="open-source-contributions-heading"
        data-anime
        className="work-experience-card text-2xl font-bold font-display text-pink-950 tracking-wide pt-2"
      >
        Open Source Contributions
      </h2>
      <p data-anime className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
        Here are some of my merged pull requests across various open source projects.
      </p>
      <div data-anime className="text-center py-8 border border-pink-200">
        <p className="text-sm font-body text-pink-950/60">
          Open source contributions loading...
        </p>
      </div>
    </section>
  );
}
