export const cleanLocalStorage = (skipItems: string[]) => {
	const items = { ...localStorage };
	delete items.tokensAccount;
	for (const item in items) {
		const id = skipItems.findIndex((i) => i === item);
		if (id === -1) localStorage.removeItem(item);
	}
};
