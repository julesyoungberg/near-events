export {};

declare global {
    interface Window {
        accountId: any;
        contract: any;
        nearInitPromise: Promise<any>;
        walletConnection: any;
    }
}
