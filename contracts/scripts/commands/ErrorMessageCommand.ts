export default abstract class ErrorMessageCommand {
    public readonly errorMessage?: string

    constructor({ errorMessage }: { errorMessage?: string } = {}) {
        this.errorMessage = errorMessage
    }
}
