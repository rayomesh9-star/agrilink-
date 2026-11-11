import useReveal from "../hooks/useReveal.js";

const sections = [
  { id: "background", title: "Background", body: "Agriculture is a connected network of producers, buyers, wholesalers, retailers, brokers, transporters and input suppliers. Many of them still rely on fragmented channels and informal networks to find produce, agree prices, confirm supply and arrange transport." },
  { id: "problem", title: "The problem", body: "Farmers can struggle to find reliable buyers and current prices. Buyers can struggle to find suppliers with the right produce, quantity, quality and location. Limited, late information adds friction, cost and avoidable post-harvest losses." },
  { id: "solution", title: "What AgriLink is", body: "A web-based marketplace and information platform where stakeholders create profiles, list or discover produce and services, communicate and coordinate orders. It is a connection and coordination platform. It does not promise guaranteed buyers, prices or income." },
  { id: "brokers", title: "Brokers are not the enemy", body: "Brokers and aggregators provide real services: collection, transport, financing, sorting and access to markets. AgriLink aims to improve transparency and give everyone more options, not to remove anyone from the chain." },
  { id: "research", title: "Research first", body: "Build around verified user problems. Value should be shown through research and usability testing, not assumed from a feature list. Claims about income or post-harvest loss are only made when real evidence exists." },
];

export default function About() {
  useReveal();
  return (
    <main className="page-pad about">
      <header className="page-head">
        <small>About the project</small>
        <h1 className="display">Making agricultural trade easier to see.</h1>
      </header>
      <div className="about-grid">
        <aside aria-label="On this page">
          {sections.map((s) => <a key={s.id} href={`#${s.id}`} data-cursor="Go">{s.title}</a>)}
        </aside>
        <div>
          {sections.map((s) => (
            <section id={s.id} key={s.id} data-reveal>
              <h2 className="display">{s.title}</h2>
              <p>{s.body}</p>
              {s.id === "research" && <blockquote className="display">Technology alone does not solve every structural challenge.</blockquote>}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
