type RoadmapGroup = {
  title: string;
  items: string[];
};

type AdminRoadmapPanelProps = {
  groups: RoadmapGroup[];
};

export function AdminRoadmapPanel({ groups }: AdminRoadmapPanelProps) {
  return (
    <section className="adminRoadmapPanel" id="roadmap">
      <div className="adminSectionHeader">
        <p className="eyebrow">Roadmap</p>
        <h2>Project Atlas delivery map</h2>
      </div>
      <div className="adminRoadmapGrid">
        {groups.map((group) => (
          <article className="adminRoadmapGroup" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
