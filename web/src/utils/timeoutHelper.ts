export const timeoutPromise = new Promise((resolve, reject) => {
	setTimeout(() => {
		reject(new Error("Some information couldn't be obtained in a reasonable time."));
	}, 10000);
});
