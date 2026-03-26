import { Program, AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import type { Contract } from "./contract";
import { IDL } from "./idl";

export type { Contract } from "./contract";
export { AnchorProvider, BN, Wallet, Program } from "@coral-xyz/anchor";

export function createProgram(provider: AnchorProvider): Program<Contract> {
  return new Program<Contract>(IDL as unknown as Contract, provider);
}
