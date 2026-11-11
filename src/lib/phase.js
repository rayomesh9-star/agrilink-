// Which build phase a route belongs to (0 = core pages such as Home, About, Roadmap, Join)
const P1 = ["/marketplace", "/prices", "/auth", "/dashboard"];
const P2 = ["/messages", "/logistics", "/inputs", "/trust"];
const P3 = ["/payments", "/insights"];
const has = (list, p) => list.some((x) => p.startsWith(x));
export const phaseOf = (p) => (has(P3, p) ? 3 : has(P2, p) ? 2 : has(P1, p) ? 1 : 0);
