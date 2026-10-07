const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const path = require("path");
const { applyTheme } = require("/root/.claude/skills/synced/9a77c1d4-01fc-4922-b594-7fee04c7716b_4527abde-4f2e-4599-81cd-5c33e1984630/pptx/scripts/apply_theme.js");

const DIR = __dirname;
const IMG = path.join(DIR, "..", "..", "images");
const OUT = path.join(DIR, "Tethered_6U_team_meeting.pptx");

const THEME = {
  name: "Tethered 6U",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0F1C2E", lt1: "FFFFFF", dk2: "1D3557", lt2: "EEF2F6",
    accent1: "1B998B", accent2: "E8913A", accent3: "D1495B", accent4: "6C8EAD",
    accent5: "2E7D5B", accent6: "8A96A3", hlink: "1B998B", folHlink: "6C8EAD",
  },
};

async function icon(Comp, hex = "FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Tethered 6U CubeSat: tether range, attitude, heritage and 3D imaging";
  pres.author = "CUBICS 2026 team";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333;

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: "DARK_TITLE",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 11.7, h: 1.7, fontSize: 44, bold: true, color: C.background1, valign: "bottom", align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.9, w: 11.7, h: 1.5, fontSize: 20, color: C.accent1, valign: "top" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.35, w: 12.1, h: 0.35, fontSize: 12, bold: true, color: C.accent1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.7, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.text1, margin: 0, valign: "top", align: "left" }, text: "" } },
      { text: { text: "CUBICS 2026 · Tethered 6U · Team meeting", options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } },
    ],
    slideNumber: { x: 12.1, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });
  pres.defineSlideMaster({
    title: "DARK_CONTENT",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.35, w: 12.1, h: 0.35, fontSize: 12, bold: true, color: C.accent2, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.7, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.background1, margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
    slideNumber: { x: 12.1, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });

  const content = (section, kicker, title) => {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
    s.addText(kicker, { placeholder: "kicker" });
    s.addText(title, { placeholder: "title" });
    return s;
  };
  const img = (s, file, x, y, w, h, name) => s.addImage({ path: file, x, y, w, h, objectName: name, altText: name });
  const fig = (f) => path.join(DIR, f);
  const circle = async (s, Comp, x, y, d, fill, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + " circle" });
    s.addImage({ data: await icon(Comp), x: x + d * 0.22, y: y + d * 0.22, w: d * 0.56, h: d * 0.56, objectName: name + " icon", altText: name });
  };
  const stat = (s, x, y, w, big, label, color, name) => {
    s.addText(big, { x, y, w, h: 0.75, fontSize: 36, bold: true, color, fontFace: THEME.headFontFace, margin: 0, isTextBox: true, objectName: name + " value" });
    s.addText(label, { x, y: y + 0.75, w, h: 0.75, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: name + " label" });
  };
  const bullets = (s, items, x, y, w, h, name, size = 16) => {
    s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1 } })),
      { x, y, w, h, fontSize: size, color: C.text1, paraSpaceAfter: 10, valign: "top", margin: 0, isTextBox: true, objectName: name });
  };

  // ---------- 1 title ----------
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "DARK_TITLE", sectionTitle: "Opening" });
  s.addText("Tethered 6U CubeSat", { placeholder: "title" });
  s.addText([
    { text: "Tether range, relative attitude, heritage and 3D imaging", options: { breakLine: true } },
    { text: "CUBICS 2026 · Stream 1 · Team meeting, October 2026", options: { fontSize: 16, color: C.accent6 } },
  ], { placeholder: "body" });
  s.addNotes("Goal of the meeting: agree on tether length, attitude sensors and the imaging claim before writing the proposal. All numbers assume two 4 kg halves at 550 km.");

  // ---------- 2 answers ----------
  s = content("Opening", "SUMMARY", "Four answers for today");
  const cards = [
    [fa.FaArrowsAltV, C.accent1, "Tether range", "Vertical only. 500 m to 1 km is feasible: 3.6 to 7.2 mN of tension and about 3.5 h to deploy."],
    [fa.FaCompass, C.accent4, "Relative attitude", "IMUs alone drift within minutes. Add a star tracker on each half and dual GNSS; use the stowed zero only to calibrate."],
    [fa.FaHistory, C.accent2, "State of the art", "Tethers have flown since 1966. Most failures happen during deployment."],
    [fa.FaMountain, C.accent3, "3D photos", "Not with a 0.5 to 1 km baseline: errors of 0.8 to 1.7 km. Yes with fore/aft camera pointing: about 3.5 m."],
  ];
  for (let i = 0; i < 4; i++) {
    const x = i % 2 ? 6.83 : 0.6, y = i < 2 ? 1.8 : 4.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.9, h: 2.35, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "card " + cards[i][2] });
    await circle(s, cards[i][0], x + 0.3, y + 0.3, 0.75, cards[i][1], cards[i][2]);
    s.addText(cards[i][2], { x: x + 1.3, y: y + 0.3, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: cards[i][2] + " header" });
    s.addText(cards[i][3], { x: x + 1.3, y: y + 0.85, w: 4.4, h: 1.35, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: cards[i][2] + " text" });
  }
  s.addNotes("One card per question raised for this meeting. The rest of the deck backs each card with numbers.");

  // ---------- section 1 ----------
  pres.addSection({ title: "Tether range and orientation" });
  s = content("Tether range and orientation", "1 · TETHER RANGE AND ORIENTATION", "Only a vertical tether stays taut");
  img(s, fig("fig_geometry.png"), 0.6, 1.75, 5.05, 5.08, "Vertical pair geometry");
  bullets(s, [
    "Gravity pulls the lower half a little more and the upper half a little less.",
    "That difference keeps the three tethers taut, with no power.",
    "The pair settles along the local vertical by itself.",
  ], 6.3, 1.9, 6.4, 2.3, "Why vertical");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 4.45, w: 6.4, h: 2.0, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "formula card" });
  s.addText("T = 3 n² m_eq L", { x: 6.6, y: 4.65, w: 5.8, h: 0.8, fontSize: 32, bold: true, color: C.accent1, fontFace: THEME.headFontFace, margin: 0, isTextBox: true, objectName: "tension formula" });
  s.addText("n = orbital rate at 550 km, m_eq = 2 kg, L = separation. Tension grows linearly with the tether length.", { x: 6.6, y: 5.45, w: 5.8, h: 0.85, fontSize: 14, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "formula caption" });
  s.addNotes("Gravity gradient: below the orbit centre gravity exceeds what circular motion needs, above it falls short. The tether supplies the difference. This only works radially; along-track gives zero tension and cross-track pushes the halves together.");

  // ---------- 5 numbers table ----------
  s = content("Tether range and orientation", "1 · TETHER RANGE AND ORIENTATION", "500 m to 1 km: the key numbers");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, align: "center" } });
  const rows = [
    [{ text: "Quantity", options: { bold: true, color: C.background1, fill: { color: C.text1 } } }, hdr("L = 500 m"), hdr("L = 1 km")],
    ["Total tension", "3.6 mN", "7.2 mN"],
    ["Tension per tether (3 tethers)", "1.2 mN", "2.4 mN"],
    ["Deployment time, controlled", "3.2 h", "3.5 h"],
    ["Free deployment, no brake", "75 min, ends at 0.95 m/s", "81 min, ends at 1.9 m/s"],
    ["Tether mass (3 × 0.2 mm)", "66 g", "132 g"],
    ["Elastic stretch at full tension", "0.2 mm", "0.8 mm"],
    ["Thermal length change (±100 K)", "0.15 to 0.5 m", "0.3 to 1.0 m"],
    ["Tether frontal area (drag)", "0.30 m²", "0.60 m²"],
    [{ text: "Orbit life at 550 km, deployed", options: { bold: true } }, { text: "≈ 1.2 years", options: { bold: true, color: C.accent3 } }, { text: "≈ 0.6 years", options: { bold: true, color: C.accent3 } }],
  ].map((r, i) => r.map((c, j) => typeof c === "string" ? { text: c, options: { align: j ? "center" : "left", fill: { color: i % 2 ? C.background1 : C.background2 } } } : c));
  s.addTable(rows, { x: 0.6, y: 1.75, w: 12.1, colW: [5.3, 3.4, 3.4], fontSize: 15, color: C.text1, rowH: 0.43, border: { type: "solid", pt: 0.5, color: "D5DCE4" }, valign: "middle", objectName: "range numbers table" });
  s.addText("Two 4 kg halves, three 0.2 mm tethers, 550 km. Orbit life uses a simple drag model with mean solar activity; the formal analysis is still to do.", { x: 0.6, y: 6.25, w: 12.1, h: 0.55, fontSize: 12, italic: true, color: C.accent6, margin: 0, isTextBox: true, objectName: "table note" });
  s.addNotes("Controlled deployment: tether paid out exponentially at half the orbital rate, which keeps libration bounded. Orbit life: the tethers themselves add 0.3 to 0.6 square metres of drag area, more than the satellites. That shortens the mission but helps the 5-year deorbit rule.");

  // ---------- 6 deployment ----------
  s = content("Tether range and orientation", "1 · TETHER RANGE AND ORIENTATION", "Slow deployment keeps the tether vertical");
  img(s, fig("fig_deploy.png"), 0.6, 1.8, 7.7, 4.33, "Deployment profile chart");
  stat(s, 8.8, 1.85, 3.9, "3.2–3.5 h", "controlled deployment to 500 m or 1 km", C.accent1, "deploy time");
  stat(s, 8.8, 3.45, 3.9, "< 30°", "libration during a controlled deployment", C.accent4, "libration");
  stat(s, 8.8, 5.05, 3.9, "1.9 m/s", "end speed of a free 1 km deployment: the tether tumbles", C.accent3, "free speed");
  s.addNotes("The winch pays the tether out slowly. Too fast and the Coriolis effect tips the tether towards horizontal. The free curve is the textbook cosh solution, which ignores libration.");

  // ---------- 7 diagonal ----------
  s = content("Tether range and orientation", "1 · TETHER RANGE AND ORIENTATION", "A diagonal tether cannot be held");
  bullets(s, [
    "Gravity always pulls the pair back to vertical; a tilt becomes a 55-minute swing.",
    "Holding 30° at 1 km would need 3.1 N·m, about 3,000 times a reaction wheel.",
    "A tilted tether also carries less tension: cos² of the angle.",
  ], 0.6, 1.95, 4.9, 4.0, "Diagonal points");
  img(s, fig("fig_diagonal.png"), 5.7, 1.8, 7.0, 3.96, "Torque needed to hold a tilt");
  s.addText("Diagonal is a swing, not a configuration", { x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 18, bold: true, color: C.accent3, margin: 0, isTextBox: true, objectName: "diagonal takeaway" });
  s.addNotes("Static tension at angle phi is 3 n^2 m_eq L cos^2 phi, and the gravity-gradient torque 3 n^2 I sin phi cos phi always pushes back to vertical. Only wheels could hold the angle and they are three orders of magnitude too weak.");

  // ---------- 8 separation does not grow ----------
  s = content("Tether range and orientation", "1 · TETHER RANGE AND ORIENTATION", "Once deployed, the length stays fixed");
  s.addText("The winch sets the length. More tension does not lengthen the tether; it only pulls it tighter.", { x: 0.6, y: 1.8, w: 12.1, h: 0.5, fontSize: 18, color: C.text1, margin: 0, isTextBox: true, objectName: "separation lead" });
  const trio = [
    [fa.FaRulerVertical, C.accent1, "< 1 mm", "elastic stretch at full tension, even at 1 km"],
    [fa.FaThermometerHalf, C.accent2, "up to 1 m", "length change between sun and shadow: the winch must compensate"],
    [fa.FaSyncAlt, C.accent4, "55 min", "period of the natural swing around vertical"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.13;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.65, w: 3.85, h: 3.4, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "fact card " + i });
    await circle(s, trio[i][0], x + 0.3, 2.95, 0.75, trio[i][1], "fact " + i);
    s.addText(trio[i][2], { x: x + 0.3, y: 3.95, w: 3.3, h: 0.8, fontSize: 36, bold: true, color: trio[i][1], fontFace: THEME.headFontFace, margin: 0, isTextBox: true, objectName: "fact value " + i });
    s.addText(trio[i][3], { x: x + 0.3, y: 4.8, w: 3.3, h: 1.1, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "fact label " + i });
  }
  s.addText("Paying out faster only adds swing and braking load; it does not give a longer or tighter tether.", { x: 0.6, y: 6.3, w: 12.1, h: 0.45, fontSize: 14, italic: true, color: C.accent6, margin: 0, isTextBox: true, objectName: "separation note" });
  s.addNotes("Answer to the idea that the tether keeps separating as speed or tension grows: tension rises linearly with length (3.6 mN at 500 m, 7.2 mN at 1 km) but the stretch is below a millimetre. The real length change is thermal, up to a metre at 1 km for polyethylene fibre, which is why active winch compensation matters.");

  // ---------- section 2 attitude ----------
  pres.addSection({ title: "Relative attitude" });
  s = content("Relative attitude", "2 · RELATIVE ATTITUDE", "IMUs alone lose the zero within minutes");
  img(s, fig("fig_imu.png"), 0.6, 1.8, 7.6, 4.38, "Gyro drift chart");
  bullets(s, [
    "Gyros measure rotation rate, so small errors add up over time.",
    "A good 1°/h MEMS gyro is off by 1.6° after one orbit.",
    "Accelerometers cannot sense attitude in free fall.",
    "Mapping images needs 0.01 to 0.05°: only an absolute sensor holds that.",
  ], 8.6, 1.95, 4.1, 4.3, "IMU points");
  s.addNotes("Setting both IMUs to zero while the halves are joined is a good calibration step, but it does not survive. The error grows with time and cannot be reset without an external reference.");

  s = content("Relative attitude", "2 · RELATIVE ATTITUDE", "Recommended sensors for relative attitude");
  const sens = [
    [fa.FaStar, C.accent1, "Star tracker on each half", "Absolute attitude of each half to about 0.005°, at any time."],
    [fa.FaSatelliteDish, C.accent4, "GNSS receiver on each half", "Relative position at centimetre level: tether direction to about 0.001° at 1 km."],
    [fa.FaArrowsAltV, C.accent2, "Tether direction encoders", "Angle of the tether at each anchor, measured directly."],
    [fa.FaSyncAlt, C.accent6, "IMU", "Fast rates between updates and during manoeuvres."],
  ];
  for (let i = 0; i < 4; i++) {
    const y = 1.85 + i * 1.02;
    await circle(s, sens[i][0], 0.6, y, 0.72, sens[i][1], sens[i][2]);
    s.addText(sens[i][2], { x: 1.6, y: y - 0.02, w: 11.1, h: 0.4, fontSize: 18, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: sens[i][2] + " header" });
    s.addText(sens[i][3], { x: 1.6, y: y + 0.38, w: 11.1, h: 0.4, fontSize: 15, color: C.text1, margin: 0, isTextBox: true, objectName: sens[i][2] + " text" });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.0, w: 12.1, h: 0.75, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "stowed zero box" });
  s.addText([{ text: "Stowed zero: ", options: { bold: true } }, { text: "use the joined state to calibrate the mounting offset between both halves, not as the reference for the whole mission." }],
    { x: 0.85, y: 6.05, w: 11.6, h: 0.65, fontSize: 15, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "stowed zero text" });
  s.addNotes("Relative attitude = attitude of B minus attitude of A, each from its own star tracker. Dual GNSS gives the baseline vector, i.e. the tether direction. Encoders give a third, independent check.");

  // ---------- section 3 heritage ----------
  pres.addSection({ title: "State of the art" });
  s = content("State of the art", "3 · STATE OF THE ART", "Tether heritage: deployment is the main risk");
  const mrow = (m, y, l, r, bad) => [m, y, l, { text: r, options: { color: bad ? C.accent3 : C.text1, bold: !!bad } }];
  const missions = [
    [{ text: "Mission", options: { bold: true, color: C.background1, fill: { color: C.text1 } } }, hdr("Year"), hdr("Length"), { text: "What happened", options: { bold: true, color: C.background1, fill: { color: C.text1 } } }],
    mrow("Gemini XI", "1966", "30 m", "First tether test between two spacecraft"),
    mrow("SEDS-1", "1993", "20 km", "Full deployment; end mass deorbited"),
    mrow("SEDS-2", "1994", "19.7 km", "Closed-loop braking law validated"),
    mrow("TSS-1R", "1996", "19.7 km", "Tether broke by an electrical arc", true),
    mrow("TiPS", "1996", "4 km", "Libration damped from 40° to 7.5°"),
    mrow("ATEx", "1999", "22 m of 6.2 km", "Tether went slack after a thermal transient", true),
    mrow("YES2", "2007", "31.7 km", "Longest structure deployed in orbit"),
    mrow("TEPCE", "2019", "1 km", "Two CubeSat halves split by a stacer spring at 4 m/s"),
  ].map((r, i) => r.map((c, j) => typeof c === "string" ? { text: c, options: { align: j === 1 || j === 2 ? "center" : "left", fill: { color: i % 2 ? C.background1 : C.background2 } } } : (i ? { text: c.text, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 } }, c.options) } : c)));
  s.addTable(missions, { x: 0.6, y: 1.75, w: 12.1, colW: [2.2, 1.2, 2.2, 6.5], fontSize: 15, color: C.text1, rowH: 0.47, border: { type: "solid", pt: 0.5, color: "D5DCE4" }, valign: "middle", objectName: "mission table" });
  s.addNotes("Failures cluster in deployment: friction, slack and electrical issues. ATEx is the closest warning for us: the tether went slack after sunrise. TEPCE is the closest architecture: a CubeSat split in two by a spring.");

  s = content("State of the art", "3 · STATE OF THE ART", "Previous tethered systems");
  const prev = [
    ["1.png", 600, 400, "Two CubeSats joined by a tether"],
    ["2.png", 760, 500, "Two end bodies joined by a tether with a three-line bridle"],
    ["3.png", 380, 179, "Tether between a spacecraft and a target body"],
    ["4.png", 396, 157, "Momentum-exchange tether: catch and toss of a payload"],
  ];
  for (let i = 0; i < 4; i++) {
    const cx = i % 2 ? 6.83 : 0.6, cy = i < 2 ? 1.75 : 4.35, cw = 5.9, ch = 2.05;
    const [f, pw, ph, cap] = prev[i];
    const sc = Math.min(cw / pw, ch / ph), w = pw * sc, h = ph * sc;
    s.addImage({ path: path.join(IMG, f), x: cx + (cw - w) / 2, y: cy + (ch - h) / 2, w, h, objectName: "prior work " + (i + 1), altText: cap });
    s.addText(cap, { x: cx, y: cy + ch + 0.05, w: cw, h: 0.4, fontSize: 12, color: C.accent6, align: "center", margin: 0, isTextBox: true, objectName: "prior work caption " + (i + 1) });
  }
  s.addNotes("Images provided by the team from previous tether work. Confirm the original mission and source of each image before citing them in the proposal.");

  s = content("State of the art", "3 · STATE OF THE ART", "Where our proposal fits");
  const col = async (x, head, color, Comp, items, name) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: 5.9, h: 4.9, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: name + " card" });
    s.addText(head, { x: x + 0.35, y: 2.0, w: 5.2, h: 0.5, fontSize: 20, bold: true, color, margin: 0, isTextBox: true, objectName: name + " header" });
    const ic = await icon(Comp, color === C.accent1 ? THEME.colors.accent1 : THEME.colors.accent2);
    for (let i = 0; i < items.length; i++) {
      const y = 2.75 + i * 0.95;
      s.addImage({ data: ic, x: x + 0.35, y: y + 0.05, w: 0.32, h: 0.32, objectName: name + " mark " + i, altText: "" });
      s.addText(items[i], { x: x + 0.85, y, w: 4.75, h: 0.85, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: name + " item " + i });
    }
  };
  await col(0.6, "Already demonstrated", C.accent1, fa.FaCheck, [
    "Splitting a CubeSat in two with a spring (TEPCE, 2019)",
    "Kilometre-class deployment with braking (SEDS-2, TiPS)",
    "Gravity-gradient stabilisation along the vertical",
    "Libration damping with the winch",
  ], "done");
  await col(6.83, "New in this proposal", C.accent2, fa.FaPlus, [
    "Three tethers between the same two bodies",
    "Active thermal compensation of length (the ATEx failure)",
    "Tether direction measured at the anchors",
    "Earth imaging from both halves",
  ], "new");
  s.addNotes("The novelty is not deploying a tether, which is well proven, but controlling three tethers and their thermal length change at CubeSat scale.");

  // ---------- section 4 3D ----------
  pres.addSection({ title: "3D imaging" });
  s = content("3D imaging", "4 · 3D IMAGING", "3D needs two very different viewing angles");
  img(s, fig("fig_parallax.png"), 1.9, 1.75, 9.5, 5.02, "Parallax geometry");
  s.addNotes("Height comes from parallax: how much a summit shifts between two photos. The shift is proportional to the baseline divided by the altitude, B/H.");

  s = content("3D imaging", "4 · 3D IMAGING", "A 0.5–1 km baseline gives errors near 1 km");
  img(s, fig("fig_stereo.png"), 0.6, 1.8, 7.6, 4.33, "Height error versus baseline");
  stat(s, 8.6, 1.85, 4.1, "825 m", "height error with a 1 km baseline, 5 m pixels", C.accent3, "error 1 km");
  stat(s, 8.6, 3.45, 4.1, "1.65 km", "height error with a 500 m baseline", C.accent3, "error 500 m");
  stat(s, 8.6, 5.05, 4.1, "0.36 px", "shift of a 1 km-high mountain between the two photos", C.accent3, "parallax");
  s.addText("And a vertical tether gives no stereo at all: both cameras look along the same line.", { x: 0.6, y: 6.3, w: 7.6, h: 0.45, fontSize: 14, italic: true, color: C.accent6, margin: 0, isTextBox: true, objectName: "vertical note" });
  s.addNotes("Height error = matching error / (B/H). With 0.3 pixel matching at 5 m pixels, that is 1.5 m divided by B/H. Even a horizontal 1 km baseline gives B/H = 0.0018. Relief needs at least about 8 km of baseline for 100 m error.");

  s = content("3D imaging", "4 · 3D IMAGING", "What works: pointing the cameras");
  const opt = [
    [{ text: "Option", options: { bold: true, color: C.background1, fill: { color: C.text1 } } }, hdr("B/H"), hdr("Height error 5 m / 20 m px"), hdr("Notes")],
    ["Fixed fore/aft cameras (A +12°, B −12°)", "0.43", "3.5 m / 14 m", "Simple; sites under the track"],
    ["Gimbal ±30° on each half", "0.40", "3.8 m / 15 m", "Chosen sites; 2 to 4 day revisit"],
    [{ text: "Tether baseline, 1 km", options: { color: C.accent3, bold: true } }, "0.0018", "825 m / 3.3 km", { text: "Not usable", options: { color: C.accent3, bold: true } }],
  ].map((r, i) => r.map((c, j) => typeof c === "string" ? { text: c, options: { align: j ? "center" : "left", fill: { color: i % 2 ? C.background1 : C.background2 } } } : (i ? { text: c.text, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, align: j ? "center" : "left" }, c.options) } : c)));
  s.addTable(opt, { x: 0.6, y: 1.8, w: 7.7, colW: [2.6, 0.9, 1.9, 2.3], fontSize: 14, color: C.text1, rowH: 0.95, border: { type: "solid", pt: 0.5, color: "D5DCE4" }, valign: "middle", objectName: "imaging options table" });
  img(s, fig("fig_sim3d.png"), 8.6, 1.8, 4.1, 2.78, "3D simulator screenshot");
  s.addText("Simulator: both halves image the same hill 31 s apart", { x: 8.6, y: 4.65, w: 4.1, h: 0.6, fontSize: 12, color: C.accent6, margin: 0, isTextBox: true, objectName: "simulator caption" });
  s.addText("The 3D comes from the satellite moving along its orbit, not from the tether.", { x: 0.6, y: 6.0, w: 12.1, h: 0.5, fontSize: 18, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: "imaging takeaway" });
  s.addNotes("Fore/aft: half A looks 12 degrees ahead, half B 12 degrees behind; 234 km of orbit between shots. The gimbal adds 635 km of reachable swath. Present 3D as a secondary objective; the tether's value is thermal compensation and metrology.");

  // ---------- risks ----------
  pres.addSection({ title: "Risks and next steps" });
  s = content("Risks and next steps", "5 · RISKS AND NEXT STEPS", "Going to 1 km adds new risks");
  const risks = [
    [fa.FaWind, C.accent3, "Drag", "Tethers add 0.6 m² of drag area. Orbit life at 550 km falls to about 0.6 years."],
    [fa.FaThermometerHalf, C.accent2, "Thermal", "Up to 1 m of length change per orbit. The winch needs that range and control."],
    [fa.FaExclamationTriangle, C.accent3, "Debris", "A 1 km object has a larger collision cross-section. Confirm admissibility with CSA."],
    [fa.FaWeightHanging, C.accent4, "Mass", "132 g of tether and larger drums inside two 3U halves."],
  ];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.08;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.85, w: 2.85, h: 4.6, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "risk card " + risks[i][2] });
    await circle(s, risks[i][0], x + 0.3, 2.15, 0.75, risks[i][1], risks[i][2]);
    s.addText(risks[i][2], { x: x + 0.3, y: 3.1, w: 2.3, h: 0.5, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: risks[i][2] + " header" });
    s.addText(risks[i][3], { x: x + 0.3, y: 3.65, w: 2.3, h: 2.6, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: risks[i][2] + " text" });
  }
  s.addNotes("The drag point is the surprise: at 1 km the tethers dominate the drag. That helps deorbit compliance but may make the mission shorter than the operations plan. Run a formal lifetime analysis with STELA or DRAMA.");

  s = pres.addSlide({ masterName: "DARK_CONTENT", sectionTitle: "Risks and next steps" });
  s.addText("5 · RISKS AND NEXT STEPS", { placeholder: "kicker" });
  s.addText("Decisions for the team", { placeholder: "title" });
  const steps = [
    ["Tether length", "500 m or 1 km, weighed against mission life (1.2 vs 0.6 years at 550 km)."],
    ["Attitude sensors", "Star tracker and GNSS on each half; IMU and encoders as support."],
    ["Imaging claim", "Drop tether stereo; use fore/aft or gimbal cameras for 3D."],
    ["Questions to CSA by 9 Nov", "Launch altitude, tether admissibility, deorbit case."],
    ["Analysis", "Formal orbit-life study and thermal model of the tether."],
  ];
  for (let i = 0; i < steps.length; i++) {
    const y = 1.85 + i * 0.98;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.62, h: 0.62, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "step circle " + (i + 1) });
    s.addText(String(i + 1), { x: 0.6, y, w: 0.62, h: 0.62, fontSize: 18, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "step number " + (i + 1) });
    s.addText(steps[i][0], { x: 1.5, y: y - 0.05, w: 11.2, h: 0.4, fontSize: 18, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: "step header " + (i + 1) });
    s.addText(steps[i][1], { x: 1.5, y: y + 0.33, w: 11.2, h: 0.4, fontSize: 15, color: C.accent6, margin: 0, isTextBox: true, objectName: "step text " + (i + 1) });
  }
  s.addNotes("Close by agreeing owners and dates for each decision. Questions to CSA must go out before 9 November.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
