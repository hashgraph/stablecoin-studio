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
