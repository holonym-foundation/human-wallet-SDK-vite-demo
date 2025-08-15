/**
 * Method names for request and response messages
 */
export enum SILK_METHOD {
  // --- Eth RPC methods ---
  eth_requestAccounts = "eth_requestAccounts", // https://eips.ethereum.org/EIPS/eip-1102
  eth_accounts = "eth_accounts",
  eth_sendTransaction = "eth_sendTransaction",
  eth_getBalance = "eth_getBalance",
  personal_sign = "personal_sign",
  eth_signTypedData_v4 = "eth_signTypedData_v4",
  eth_chainId = "eth_chainId",
  net_version = "net_version",
  wallet_switchEthereumChain = "wallet_switchEthereumChain",
  wallet_addEthereumChain = "wallet_addEthereumChain",
  eth_estimateGas = "eth_estimateGas",
  eth_blockNumber = "eth_blockNumber",
  eth_getCode = "eth_getCode",
  eth_call = "eth_call",
  eth_getTransactionReceipt = "eth_getTransactionReceipt",
  eth_getTransactionByHash = "eth_getTransactionByHash",
  eth_accountsChanged = "eth_accountsChanged",
  // --- Other ---
  // The Silk site uses hide_modal to tell the wallet sdk (on the host site)
  // to hide the Silk modal.
  show_modal = "show_modal",
  hide_modal = "hide_modal",
  login = "login",
  auto_conn = "auto_conn",
  logout = "logout",
  set_points_referral_code = "set_points_referral_code",
  set_project = "set_project",
  silk_requestEmail = "silk_requestEmail",
  silk_requestSbt = "silk_requestSbt",
  set_custom_config = "set_custom_config",
  safe = "safe",
  // --- Portal Admin ---
  project_init = "project_init",
  gastank_get_settings = "gastank_get_settings",
  gastank_update_settings = "gastank_update_settings",
  gastank_topup = "gastank_topup",
  customization_get = "customization_get",
  customization_update = "customization_update",
  // --- ORCID ---
  orcid = "orcid",
}

export type CredentialType = "kyc" | "phone";

export enum JSON_RPC_METHOD {
  eth_requestAccounts = "eth_requestAccounts",
  eth_accounts = "eth_accounts",
  eth_sendTransaction = "eth_sendTransaction",
  eth_getBalance = "eth_getBalance",
  personal_sign = "personal_sign",
  eth_signTypedData_v4 = "eth_signTypedData_v4",
  eth_chainId = "eth_chainId",
  net_version = "net_version",
  wallet_switchEthereumChain = "wallet_switchEthereumChain",
  wallet_addEthereumChain = "wallet_addEthereumChain",
  eth_estimateGas = "eth_estimateGas",
  eth_blockNumber = "eth_blockNumber",
  eth_getCode = "eth_getCode",
  eth_call = "eth_call",
  eth_getTransactionReceipt = "eth_getTransactionReceipt",
  eth_getTransactionByHash = "eth_getTransactionByHash",
}

export type AuthenticationMethod =
  | "email"
  | "phone"
  | "social"
  | "biometrics"
  | "wallet";

export type SocialProvider =
  | "discord"
  | "github"
  | "google"
  | "linkedin"
  | "twitter";
