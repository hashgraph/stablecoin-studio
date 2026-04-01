export async function delay({
    time,
    unit = 'ms',
}: {
    time: number
    unit?: 'seconds' | 'milliseconds' | 'sec' | 'ms'
}): Promise<boolean> {
    let delayInMilliseconds: number
    if (unit === 'seconds' || unit === 'sec') {
        delayInMilliseconds = time * 1000
    } else if (unit === 'milliseconds' || unit === 'ms') {
        delayInMilliseconds = time
    } else {
        throw new Error('Invalid time unit. Please use "seconds", "milliseconds", "sec", or "ms".')
    }
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), delayInMilliseconds))
}

export function getOneMonthFromNowInSeconds(): number {
    const secondsInOneMonth = 30 * 24 * 60 * 60 // Assuming 30 days in a month
    const currentTimeInSeconds = Math.floor(Date.now() / 1000)
    return currentTimeInSeconds + secondsInOneMonth
}
