export const WATCHLIST_CATEGORIES = [
    { label: "Watching", value: "watching" },
    { label: "Completed", value: "completed" },
    { label: "Planning", value: "plan_to_watch" },
    { label: "Paused", value: "on_hold" },
    { label: "Dropped", value: "dropped" },
]

export function getCategoryLabel(value) {
    const found = WATCHLIST_CATEGORIES.find((cat) => cat.value === value)
    return found ? found.label : value
}