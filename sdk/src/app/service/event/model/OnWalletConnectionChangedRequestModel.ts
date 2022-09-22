import { HashConnectConnectionState } from "hashconnect/dist/esm/types/hashconnect.js";

export default interface OnWalletConnectionChangedRequestModel {
	listener: (state: HashConnectConnectionState) => void;
}
