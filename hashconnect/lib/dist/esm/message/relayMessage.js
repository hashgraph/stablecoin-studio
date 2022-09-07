export class RelayMessage {
    constructor(timestamp, type, data, topic) {
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
        this.topic = topic;
    }
}
export var RelayMessageType;
(function (RelayMessageType) {
    RelayMessageType["Transaction"] = "Transaction";
    RelayMessageType["TransactionResponse"] = "TransactionResponse";
    RelayMessageType["ApprovePairing"] = "ApprovePairing";
    RelayMessageType["RejectPairing"] = "RejectPairing";
    RelayMessageType["Acknowledge"] = "Acknowledge";
    RelayMessageType["AdditionalAccountRequest"] = "AdditionalAccountRequest";
    RelayMessageType["AdditionalAccountResponse"] = "AdditionalAccountResponse";
    RelayMessageType["AuthenticationRequest"] = "AuthenticationRequest";
    RelayMessageType["AuthenticationResponse"] = "AuthenticationResponse";
})(RelayMessageType || (RelayMessageType = {}));
// export enum TransactionType {
//     contractCall="contractCall",
//     contractCreateInstance="contractCreateInstance",
//     contractUpdateInstance="contractUpdateInstance",
//     contractDeleteInstance="contractDeleteInstance",
//     cryptoCreateAccount="cryptoCreateAccount",
//     cryptoDelete="cryptoDelete",
//     cryptoTransfer="cryptoTransfer",
//     cryptoUpdateAccount="cryptoUpdateAccount",
//     fileAppend="fileAppend",
//     fileCreate="fileCreate",
//     fileDelete="fileDelete",
//     fileUpdate="fileUpdate",
//     systemDelete="systemDelete",
//     systemUndelete="systemUndelete",
//     freeze="freeze",
//     consensusCreateTopic="consensusCreateTopic",
//     consensusUpdateTopic="consensusUpdateTopic",
//     consensusDeleteTopic="consensusDeleteTopic",
//     consensusSubmitMessage="consensusSubmitMessage",
//     tokenCreation="tokenCreation",
//     tokenFreeze="tokenFreeze",
//     tokenUnfreeze="tokenUnfreeze",
//     tokenGrantKyc="tokenGrantKyc",
//     tokenRevokeKyc="tokenRevokeKyc",
//     tokenDeletion="tokenDeletion",
//     tokenUpdate="tokenUpdate",
//     tokenMint="tokenMint",
//     tokenBurn="tokenBurn",
//     tokenWipe="tokenWipe",
//     tokenAssociate="tokenAssociate",
//     tokenDissociate="tokenDissociate",
//     token_pause="token_pause",
//     token_unpause="token_unpause",
//     scheduleDelete="scheduleDelete",
// }
//# sourceMappingURL=relayMessage.js.map