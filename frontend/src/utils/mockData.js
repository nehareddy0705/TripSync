// Activity log storage helper (local to frontend session/browser)
// Note: Hardcoded mock trips and mock activities have been completely removed.

export const getActivities = () => {
  const all = JSON.parse(localStorage.getItem("activities") || "[]");
  const mockIds = ["act_1", "act_2", "act_3", "act_4"];
  return all.filter(act => !mockIds.includes(act.id));
};

export const logActivity = (activity) => {
  const activities = getActivities();
  const newActivity = {
    id: `act_${Date.now()}`,
    ...activity
  };
  activities.unshift(newActivity);
  localStorage.setItem("activities", JSON.stringify(activities.slice(0, 10))); // Cap at 10 items
};

export const clearActivities = () => {
  localStorage.removeItem("activities");
};
