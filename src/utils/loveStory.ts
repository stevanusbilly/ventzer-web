export const LOVE_STORY_CATEGORY = "Love Story";

export const isLoveStoryCategory = (name?: string | null): boolean =>
	String(name || "").trim().toLowerCase() === "love story";
