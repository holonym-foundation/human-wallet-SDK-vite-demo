import { ChainNotConfiguredError, createConnector } from "@wagmi/core";
import { getAddress, SwitchChainError, UserRejectedRequestError } from "viem";

import { type CredentialType, SILK_METHOD } from "../types";
import {
  type SilkEthereumProviderInterface,
  initSilk,
} from "@silk-wallet/silk-wallet-sdk";
import type { InitSilkOptions } from "@silk-wallet/silk-wallet-sdk";

// For reference: WAGMI connector event map: wagmi/packages/core/src/connectors/createConnector.ts
// type ConnectorEventMap = {
//   change: {
//     accounts?: readonly Address[] | undefined
//     chainId?: number | undefined
//   }
//   connect: { accounts: readonly Address[]; chainId: number }
//   disconnect: never
//   error: { error: Error }
//   message: { type: string; data?: unknown | undefined }
// }

/**
 * Creates a WAGMI connector for the Silk Wallet SDK
 * @param options the initialization options passed to the Silk Wallet SDK
 * @returns
 */
export default function silk(options?: InitSilkOptions) {
  let silkProvider: SilkEthereumProviderInterface | null = null;

  return createConnector<SilkEthereumProviderInterface>((config) => {
    console.log("Silk Connector Config:", config);
    return {
      id: "silk",
      name: "Silk Connector",
      type: "Silk",
      chains: config.chains,
      supportsSimulation: false,

      async connect({ chainId } = {}) {
        try {
          config.emitter.emit("message", {
            type: "connecting",
          });
          const provider = await this.getProvider();

          if (!provider.connected) {
            try {
              await provider.login();
            } catch (error) {
              console.warn("Unable to login", error);
              throw new UserRejectedRequestError(
                "User rejected login or login failed" as unknown as Error
              );
            }
          }

          let currentChainId = await this.getChainId();
          if (chainId && currentChainId !== chainId) {
            console.info(
              `Switching chain from ${currentChainId} to ${chainId}`
            );
            // biome-ignore lint/style/noNonNullAssertion: the switchChain method is defined in the connector
            const chain = await this.switchChain!({ chainId }).catch(
              (error) => {
                if (error.code === UserRejectedRequestError.code) throw error;
                return { id: currentChainId };
              }
            );
            currentChainId = chain?.id ?? currentChainId;
          }

          const accounts = await this.getAccounts();

          return { accounts, chainId: currentChainId };
        } catch (error) {
          console.error("Error while connecting", error);
          this.onDisconnect();
          throw error;
        }
      },

      async getAccounts() {
        const provider = await this.getProvider();
        const accounts = await provider.request({
          method: SILK_METHOD.eth_accounts,
        });

        if (accounts && Array.isArray(accounts))
          return accounts.map((x: string) => getAddress(x));
        return [];
      },

      async getChainId() {
        const provider = await this.getProvider();
        const chainId = await provider.request({
          method: SILK_METHOD.eth_chainId,
        });
        return Number(chainId);
      },

      async getProvider(): Promise<SilkEthereumProviderInterface> {
        if (!silkProvider) {
          console.log("Initializing Silk Provider with options:", options);
          silkProvider = initSilk(options ?? {});
        }

        return silkProvider;
      },

      async isAuthorized() {
        try {
          const accounts = await this.getAccounts();
          return !!accounts.length;
        } catch {
          return false;
        }
      },

      async switchChain({ chainId }) {
        console.info("Switching chain to ID", chainId);
        try {
          const chain = config.chains.find((x) => x.id === chainId);
          if (!chain) throw new ChainNotConfiguredError();

          const provider = await this.getProvider();
          await provider.request({
            method: SILK_METHOD.wallet_switchEthereumChain,
            params: [{ chainId: `0x${chain.id.toString(16)}` }],
          });
          config.emitter.emit("change", { chainId });
          return chain;
        } catch (error: unknown) {
          console.error("Error: Unable to switch chain", error);
          throw new SwitchChainError(error as Error);
        }
      },

      async disconnect(): Promise<void> {
        const provider = await this.getProvider();
        provider.removeListener("accountsChanged", this.onAccountsChanged);
        provider.removeListener("chainChanged", this.onChainChanged);
        provider.removeListener("disconnect", this.onDisconnect);
      },

      async requestEmail(): Promise<unknown> {
        const provider = await this.getProvider();
        return provider.requestEmail();
      },

      async requestSBT(type: CredentialType): Promise<unknown> {
        const provider = await this.getProvider();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // biome-ignore lint/suspicious/noExplicitAny: the requestSBT method is not declared in the SilkEthereumProviderInterface, but is implemented in the EthereumProvider class
        return (provider as any).requestSBT(type);
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) config.emitter.emit("disconnect");
        else
          config.emitter.emit("change", {
            accounts: accounts.map((x) => getAddress(x)),
          });
      },

      onChainChanged(chain) {
        const chainId = Number(chain);
        config.emitter.emit("change", { chainId });
      },

      onDisconnect(): void {
        config.emitter.emit("disconnect");
      },
    };
  });
}
