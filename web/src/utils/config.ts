export const { CONTRACT_NAME = "events.jyoungberg.testnet" } = process.env;

export default function environment(env: string) {
    switch (env) {
        case "mainnet":
            return {
                networkId: "mainnet",
                nodeUrl: "https://rpc.mainnet.near.org",
                contractName: CONTRACT_NAME,
                walletUrl: "https://wallet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                exploreUrl: "https://explorer.mainnet.near.org",
            };
        case "testnet":
            return {
                networkId: "testnet",
                nodeUrl: "https://rpc.testnet.near.org",
                contractName: CONTRACT_NAME,
                walletUrl: "https://wallet.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://explorer.testnet.near.org",
            };
        default:
            throw new Error(`Unknown environment ${environment}`);
    }
}
