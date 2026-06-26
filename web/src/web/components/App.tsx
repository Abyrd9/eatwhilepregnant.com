import { useCallback, useEffect, useState } from "react";
import { canonicalFoodSlugPattern } from "../../core/food/food-normalization";
import type { FoodRecord } from "../../schema/food-schema";

type SearchResponse = {
	status: "ok" | "error";
	food?: FoodRecord;
	suggestions?: FoodRecord[];
	message?: string;
};

type FoodResponse = {
	status: "ok" | "error";
	food?: FoodRecord;
	message?: string;
};

type AdminFeedbackIndexResponse = {
	status: "ok" | "error";
	foodSlugs?: string[];
	message?: string;
};

type AdminFeedbackBySlugResponse = {
	status: "ok" | "error";
	feedbackItems?: Array<{
		foodSlug: string;
		foodName: string;
		feedback: string;
		createdAt: string;
	}>;
	message?: string;
};

const getFoodSlugFromPathname = (pathname: string): string | null => {
	if (pathname === "/") {
		return null;
	}

	const pathWithoutSlashes = pathname.replace(/^\//, "").replace(/\/$/, "");
	return canonicalFoodSlugPattern.test(pathWithoutSlashes)
		? pathWithoutSlashes
		: null;
};

const toReadableFoodName = (foodSlug: string): string => {
	return foodSlug
		.replace(/^can-i-eat-/, "")
		.replace(/-while-pregnant$/, "")
		.replace(/-/g, " ");
};

export const App = () => {
	const isAdminPage = window.location.pathname === "/admin";

	const [searchValue, setSearchValue] = useState("");
	const [searchInputFocused, setSearchInputFocused] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
	const [isSubmittingSearch, setIsSubmittingSearch] = useState(false);
	const [foodRecord, setFoodRecord] = useState<FoodRecord | null>(null);
	const [suggestions, setSuggestions] = useState<FoodRecord[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedbackValue, setFeedbackValue] = useState("");
	const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

	const [adminApiKey, setAdminApiKey] = useState(
		window.localStorage.getItem("adminApiKey") ?? "",
	);
	const [adminFoodSlugs, setAdminFoodSlugs] = useState<string[]>([]);
	const [selectedAdminFoodSlug, setSelectedAdminFoodSlug] = useState("");
	const [adminFeedbackItems, setAdminFeedbackItems] = useState<
		Array<{
			foodSlug: string;
			foodName: string;
			feedback: string;
			createdAt: string;
		}>
	>([]);
	const [adminStatusMessage, setAdminStatusMessage] = useState<string | null>(
		null,
	);

	const activeFoodSlug =
		foodRecord?.slug ?? getFoodSlugFromPathname(window.location.pathname);

	const normalizedSearchValue = searchValue.trim().toLowerCase();
	const hasExactSuggestionMatch =
		normalizedSearchValue.length > 0 &&
		suggestions.some((suggestion) => {
			return suggestion.name.trim().toLowerCase() === normalizedSearchValue;
		});

	const toAdminHeaders = useCallback(() => {
		const headers: Record<string, string> = {};

		if (adminApiKey.trim()) {
			headers["x-admin-key"] = adminApiKey.trim();
		}

		return headers;
	}, [adminApiKey]);

	const loadFoodBySlug = useCallback(async (foodSlug: string) => {
		const response = await fetch(`/api/food/${foodSlug}`);
		const payload = (await response.json()) as FoodResponse;

		if (!response.ok || payload.status !== "ok" || !payload.food) {
			setErrorMessage(
				payload.message ??
					`We do not have a fresh record for ${toReadableFoodName(foodSlug)} yet.`,
			);
			setFoodRecord(null);
			return;
		}

		setFoodRecord(payload.food);
		setErrorMessage(null);
		setFeedbackStatus(null);
	}, []);

	const submitSearch = async (nextSearchValue: string) => {
		const trimmedSearchValue = nextSearchValue.trim();

		if (!trimmedSearchValue) {
			setErrorMessage("Please enter a food name.");
			return;
		}

		setIsSubmittingSearch(true);
		setErrorMessage(null);

		try {
			const response = await fetch(
				`/api/search?q=${encodeURIComponent(trimmedSearchValue)}`,
			);
			const payload = (await response.json()) as SearchResponse;

			if (!response.ok || payload.status !== "ok" || !payload.food) {
				setErrorMessage(payload.message ?? "We could not process your search.");
				return;
			}

			setSearchValue(payload.food.name);
			setFoodRecord(payload.food);
			setSuggestions(payload.suggestions ?? []);
			setShowFeedbackForm(false);
			setFeedbackValue("");
			setFeedbackStatus(null);
			window.history.pushState({}, "", `/${payload.food.slug}`);
		} finally {
			setIsSubmittingSearch(false);
		}
	};

	const submitFeedback = async () => {
		if (!foodRecord || !feedbackValue.trim()) {
			setFeedbackStatus("Please add feedback before sending.");
			return;
		}

		const response = await fetch("/api/feedback", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				foodSlug: foodRecord.slug,
				foodName: foodRecord.name,
				feedback: feedbackValue.trim(),
			}),
		});

		if (!response.ok) {
			setFeedbackStatus("Thanks. We could not submit that right now.");
			return;
		}

		setFeedbackValue("");
		setShowFeedbackForm(false);
		setFeedbackStatus("Thank you for your feedback.");
	};

	const loadAdminFeedbackIndex = useCallback(async () => {
		const response = await fetch("/api/admin/feedback", {
			headers: toAdminHeaders(),
		});
		const payload = (await response.json()) as AdminFeedbackIndexResponse;

		if (!response.ok || payload.status !== "ok") {
			setAdminStatusMessage(
				payload.message ?? "Could not load feedback index.",
			);
			setAdminFoodSlugs([]);
			setSelectedAdminFoodSlug("");
			setAdminFeedbackItems([]);
			return;
		}

		const nextFoodSlugs = payload.foodSlugs ?? [];
		const nextSelectedAdminFoodSlug = nextFoodSlugs.includes(
			selectedAdminFoodSlug,
		)
			? selectedAdminFoodSlug
			: (nextFoodSlugs[0] ?? "");

		setAdminFoodSlugs(nextFoodSlugs);
		setSelectedAdminFoodSlug(nextSelectedAdminFoodSlug);
		setAdminStatusMessage(null);
	}, [selectedAdminFoodSlug, toAdminHeaders]);

	const loadAdminFeedbackBySlug = useCallback(
		async (foodSlug: string) => {
			if (!foodSlug) {
				setAdminFeedbackItems([]);
				return;
			}

			const response = await fetch(
				`/api/admin/feedback?foodSlug=${encodeURIComponent(foodSlug)}`,
				{ headers: toAdminHeaders() },
			);
			const payload = (await response.json()) as AdminFeedbackBySlugResponse;

			if (!response.ok || payload.status !== "ok") {
				setAdminStatusMessage(payload.message ?? "Could not load feedback.");
				setAdminFeedbackItems([]);
				return;
			}

			setAdminFeedbackItems(payload.feedbackItems ?? []);
			setAdminStatusMessage(null);
		},
		[toAdminHeaders],
	);

	const refreshFoodFromAdmin = async () => {
		if (!selectedAdminFoodSlug) {
			setAdminStatusMessage("Choose a food slug first.");
			return;
		}

		const response = await fetch(
			`/api/admin/refresh/${encodeURIComponent(selectedAdminFoodSlug)}`,
			{
				method: "POST",
				headers: toAdminHeaders(),
			},
		);

		if (!response.ok) {
			setAdminStatusMessage("Refresh failed.");
			return;
		}

		setAdminStatusMessage("Food refreshed.");
		await loadAdminFeedbackBySlug(selectedAdminFoodSlug);
	};

	useEffect(() => {
		if (isAdminPage) {
			return;
		}

		const trimmedSearchValue = searchValue.trim();
		if (trimmedSearchValue.length < 2) {
			setSuggestions([]);
			return;
		}

		const abortController = new AbortController();

		const timeout = setTimeout(async () => {
			try {
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(trimmedSearchValue)}&suggestOnly=true`,
					{
						signal: abortController.signal,
					},
				);

				if (!response.ok) {
					return;
				}

				const payload = (await response.json()) as SearchResponse;
				setSuggestions(payload.suggestions ?? []);
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
			}
		}, 100);

		return () => {
			abortController.abort();
			clearTimeout(timeout);
		};
	}, [isAdminPage, searchValue]);

	useEffect(() => {
		if (isAdminPage) {
			return;
		}

		const loadPath = () => {
			const pathFoodSlug = getFoodSlugFromPathname(window.location.pathname);

			if (!pathFoodSlug) {
				setFoodRecord(null);
				setSearchValue("");
				setErrorMessage(null);
				setShowFeedbackForm(false);
				return;
			}

			void loadFoodBySlug(pathFoodSlug);
		};

		loadPath();
		window.addEventListener("popstate", loadPath);

		return () => {
			window.removeEventListener("popstate", loadPath);
		};
	}, [isAdminPage, loadFoodBySlug]);

	useEffect(() => {
		if (!isAdminPage) {
			return;
		}

		window.localStorage.setItem("adminApiKey", adminApiKey);
		void loadAdminFeedbackIndex();
	}, [adminApiKey, isAdminPage, loadAdminFeedbackIndex]);

	useEffect(() => {
		if (!isAdminPage) {
			return;
		}

		void loadAdminFeedbackBySlug(selectedAdminFoodSlug);
	}, [isAdminPage, loadAdminFeedbackBySlug, selectedAdminFoodSlug]);

	useEffect(() => {
		if (!searchInputFocused || suggestions.length === 0) {
			setActiveSuggestionIndex(-1);
			return;
		}

		setActiveSuggestionIndex((currentIndex) => {
			if (currentIndex >= suggestions.length) {
				return suggestions.length - 1;
			}

			return currentIndex;
		});
	}, [searchInputFocused, suggestions]);

	if (isAdminPage) {
		return (
			<main className="admin-shell">
				<section className="admin-panel">
					<h1>Admin Feedback Review</h1>
					<p className="muted">
						Inspect user feedback and force refresh stale foods.
					</p>

					<label htmlFor="adminApiKey">Admin API key</label>
					<input
						id="adminApiKey"
						type="password"
						value={adminApiKey}
						onChange={(event) => {
							setAdminApiKey(event.target.value);
						}}
					/>

					<button
						type="button"
						onClick={() => {
							void loadAdminFeedbackIndex();
						}}
					>
						Load feedback index
					</button>

					<label htmlFor="adminFoodSlug">Food slug</label>
					<select
						id="adminFoodSlug"
						value={selectedAdminFoodSlug}
						onChange={(event) => {
							setSelectedAdminFoodSlug(event.target.value);
						}}
					>
						<option value="">Select a food slug</option>
						{adminFoodSlugs.map((foodSlug) => (
							<option key={foodSlug} value={foodSlug}>
								{foodSlug}
							</option>
						))}
					</select>

					<button
						type="button"
						onClick={() => {
							void refreshFoodFromAdmin();
						}}
					>
						Force refresh selected food
					</button>

					{adminStatusMessage ? (
						<p className="muted">{adminStatusMessage}</p>
					) : null}
				</section>

				<section className="admin-panel">
					<h2>Feedback entries</h2>
					{adminFeedbackItems.length === 0 ? (
						<p className="muted">No feedback rows for this slug.</p>
					) : (
						adminFeedbackItems.map((feedbackItem) => (
							<article
								key={`${feedbackItem.foodSlug}-${feedbackItem.createdAt}-${feedbackItem.feedback}`}
								className="admin-item"
							>
								<div className="status-label caution-text">
									{feedbackItem.foodName}
								</div>
								<p>{feedbackItem.feedback}</p>
								<p className="muted">
									{new Date(feedbackItem.createdAt).toLocaleString()}
								</p>
							</article>
						))
					)}
				</section>
			</main>
		);
	}

	const safetyLabel =
		foodRecord?.pregnancySafety === "safe"
			? "safe to eat"
			: foodRecord?.pregnancySafety === "avoid"
				? "do not eat"
				: "eat with caution";

	const shouldShowSuggestionList =
		searchInputFocused &&
		suggestions.length > 0 &&
		!isSubmittingSearch &&
		!hasExactSuggestionMatch;

	return (
		<main className="page-shell">
			<section className="layout-wrap">
				<header className="brand-header">
					<img
						src="/logo.png"
						alt="Eat While Pregnant"
						className="brand-logo"
					/>
				</header>

				<section className="content-card">
					<label htmlFor="food-search" className="search-label">
						What can I eat while pregnant?
					</label>

					<div className="search-input-wrap">
						<input
							id="food-search"
							type="text"
							placeholder="Watermelon, Deli Meat, Fish, etc."
							value={searchValue}
							autoComplete="off"
							onFocus={() => {
								setSearchInputFocused(true);
							}}
							onBlur={() => {
								window.setTimeout(() => {
									setSearchInputFocused(false);
									setActiveSuggestionIndex(-1);
								}, 100);
							}}
							onChange={(event) => {
								setSearchValue(event.target.value);
								setActiveSuggestionIndex(-1);
							}}
							onKeyDown={(event) => {
								if (event.key === "ArrowDown" && suggestions.length > 0) {
									event.preventDefault();
									setSearchInputFocused(true);
									setActiveSuggestionIndex((currentIndex) => {
										const nextIndex =
											currentIndex < 0 || currentIndex >= suggestions.length - 1
												? 0
												: currentIndex + 1;

										return nextIndex;
									});
									return;
								}

								if (event.key === "ArrowUp" && suggestions.length > 0) {
									event.preventDefault();
									setSearchInputFocused(true);
									setActiveSuggestionIndex((currentIndex) => {
										const nextIndex =
											currentIndex <= 0
												? suggestions.length - 1
												: currentIndex - 1;

										return nextIndex;
									});
									return;
								}

								if (event.key === "Escape") {
									setSearchInputFocused(false);
									setActiveSuggestionIndex(-1);
									return;
								}

								if (event.key === "Enter") {
									event.preventDefault();

									if (shouldShowSuggestionList && activeSuggestionIndex >= 0) {
										const activeSuggestion = suggestions[activeSuggestionIndex];
										if (activeSuggestion) {
											setSearchValue(activeSuggestion.name);
											void submitSearch(activeSuggestion.name);
											return;
										}
									}

									void submitSearch(searchValue);
								}
							}}
						/>
						<button
							type="button"
							className="search-submit"
							disabled={isSubmittingSearch}
							onClick={() => {
								void submitSearch(searchValue);
							}}
						>
							{isSubmittingSearch ? "Checking..." : "Search"}
						</button>

						{shouldShowSuggestionList ? (
							<div
								className="suggestions-popover"
								role="listbox"
								aria-label="Food suggestions"
							>
								{suggestions.map((suggestion, suggestionIndex) => (
									<button
										key={suggestion.slug}
										type="button"
										className={`suggestion-row ${activeSuggestionIndex === suggestionIndex ? "active" : ""}`}
										onMouseDown={(event) => {
											event.preventDefault();
										}}
										onMouseEnter={() => {
											setActiveSuggestionIndex(suggestionIndex);
										}}
										onClick={() => {
											setSearchValue(suggestion.name);
											void submitSearch(suggestion.name);
										}}
									>
										{suggestion.name}
									</button>
								))}
							</div>
						) : null}
					</div>
				</section>

				<div className="section-divider" />

				{errorMessage ? <p className="small-note">{errorMessage}</p> : null}

				{foodRecord ? (
					<section className="result-section">
						<div className={`status-banner ${foodRecord.pregnancySafety}`}>
							<span className="status-label">{safetyLabel}</span>
						</div>

						<h2>{foodRecord.name}</h2>
						<p>{foodRecord.summary}</p>
						<p>{foodRecord.details}</p>

						<p className="small-note">
							Source: {foodRecord.source}
							<span className="meta-separator">|</span>
							Reviewed: {new Date(foodRecord.reviewedAt).toLocaleDateString()}
						</p>

						{feedbackStatus ? (
							<p className="small-note success-note">{feedbackStatus}</p>
						) : null}

						{!showFeedbackForm ? (
							<p className="feedback-link-row">
								Concerned with this response?{" "}
								<button
									type="button"
									className="inline-link"
									onClick={() => {
										setShowFeedbackForm(true);
										setFeedbackStatus(null);
									}}
								>
									Let us know.
								</button>
							</p>
						) : (
							<div className="feedback-box">
								<label htmlFor="feedback-input">
									Feedback for {foodRecord.name}
								</label>
								<textarea
									id="feedback-input"
									maxLength={1000}
									value={feedbackValue}
									onChange={(event) => {
										setFeedbackValue(event.target.value);
									}}
								/>
								<div className="feedback-actions">
									<button
										type="button"
										className="feedback-submit"
										onClick={() => {
											void submitFeedback();
										}}
									>
										Submit feedback
									</button>
									<button
										type="button"
										className="feedback-cancel"
										onClick={() => {
											setShowFeedbackForm(false);
										}}
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</section>
				) : null}

				{!foodRecord && activeFoodSlug ? (
					<p className="small-note">
						No cached entry found for {toReadableFoodName(activeFoodSlug)} yet.
						Search it to generate a fresh record.
					</p>
				) : null}

				<section className="disclaimer-box">
					<strong>Disclaimer.</strong> The information on this website is not
					medical advice. Always talk with your doctor or other qualified
					healthcare provider for guidance about your pregnancy diet.
				</section>

				<footer className="site-footer">
					<span>
						Copyright {new Date().getFullYear()} eatwhilepregnant.com. All
						rights reserved.
					</span>
					<a href="mailto:abyrdwebservices@gmail.com">Contact</a>
				</footer>
			</section>
		</main>
	);
};
