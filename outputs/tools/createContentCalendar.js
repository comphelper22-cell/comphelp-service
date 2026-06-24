const { logAction } = require("./logAction");

const SERVICES = ["Security Camera Installation", "Smart Home Setup", "WiFi & Network Installation", "Computer Repair"];
const AREAS = ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"];

function createContentCalendar(input = {}) {
  const weeks = Number(input.weeks || 1);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const calendar = [];

  for (let week = 1; week <= weeks; week += 1) {
    days.forEach((day, index) => {
      const service = SERVICES[(week + index) % SERVICES.length];
      const city = AREAS[(week + index) % AREAS.length];
      calendar.push({
        week,
        day,
        platform: index % 3 === 0 ? "Instagram/Facebook" : index % 3 === 1 ? "TikTok" : "Google Business Profile",
        topic: `${service} in ${city}`,
        format: index % 3 === 1 ? "short video" : "caption + image",
        draft: `Local tip: what to check before booking ${service.toLowerCase()} in ${city}. End with a free estimate CTA.`,
        status: "draft"
      });
    });
  }

  const result = {
    ok: true,
    draftOnly: true,
    weeks,
    calendar,
    note: "Review and approve posts before publishing unless AUTO_POST=true."
  };

  logAction("createContentCalendar", result);
  return result;
}

module.exports = {
  createContentCalendar
};
