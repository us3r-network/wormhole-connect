import {
  AddressLookupTableAccount,
  Commitment,
  ConfirmOptions,
  Connection,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
} from '@solana/web3.js';

import config from 'config';
import { sleep } from 'utils';

import {
  isVersionedTransaction,
  SolanaUnsignedTransaction,
  determinePriorityFee,
} from '@wormhole-foundation/sdk-solana';
import { Network } from '@wormhole-foundation/sdk';
import { TransactionMessage } from '@solana/web3.js';
import { ComputeBudgetProgram } from '@solana/web3.js';
import { TransactionInstruction } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { ConnectedWallet, isWalletAggregatorWallet } from './wallet';

// This function signs and sends the transaction while constantly checking for confirmation
// and resending the transaction if it hasn't been confirmed after the specified interval
// See https://docs.triton.one/chains/solana/sending-txs for more information
export async function signAndSendTransaction(
  request: SolanaUnsignedTransaction<Network>,
  connectedWallet: ConnectedWallet,
  options?: ConfirmOptions,
) {
  if (!connectedWallet) throw new Error('Wallet not found');
  if (!config.rpcs.Solana) throw new Error('Solana RPC not found');
  const wallet = connectedWallet.getWallet();
  if (isWalletAggregatorWallet(wallet)) throw new Error('Wallet is a Wallet Aggregator wallet');
  if (!isSolanaWallet(wallet)) throw new Error('Wallet is not a Solana wallet');

  const commitment = options?.commitment ?? 'finalized';
  const unsignedTx = request.transaction.transaction;
  const connection = new Connection(config.rpcs.Solana);
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash(commitment);

  const computeBudgetIxFilter = (ix) =>
    ix.programId.toString() !== 'ComputeBudget111111111111111111111111111111';

  if (isVersionedTransaction(unsignedTx)) {
    const luts = (
      await Promise.all(
        unsignedTx.message.addressTableLookups.map((acc) =>
          connection.getAddressLookupTable(acc.accountKey),
        ),
      )
    )
      .map((lut) => lut.value)
      .filter((lut) => lut !== null) as AddressLookupTableAccount[];
    const message = TransactionMessage.decompile(unsignedTx.message, {
      addressLookupTableAccounts: luts,
    });
    message.recentBlockhash = blockhash;
    unsignedTx.message.recentBlockhash = blockhash;

    // Remove existing compute budget instructions if they were added by the SDK
    message.instructions = message.instructions.filter(computeBudgetIxFilter);
    message.instructions.push(
      ...(await createPriorityFeeInstructions(connection, unsignedTx)),
    );

    unsignedTx.message = message.compileToV0Message(luts);
    unsignedTx.sign(request.transaction.signers ?? []);
  } else {
    unsignedTx.recentBlockhash = blockhash;
    unsignedTx.lastValidBlockHeight = lastValidBlockHeight;

    // Remove existing compute budget instructions if they were added by the SDK
    unsignedTx.instructions = unsignedTx.instructions.filter(
      computeBudgetIxFilter,
    );
    unsignedTx.add(
      ...(await createPriorityFeeInstructions(connection, unsignedTx)),
    );
    if (request.transaction.signers) {
      unsignedTx.partialSign(...request.transaction.signers);
    }
  }

  let confirmTransactionPromise: Promise<
    RpcResponseAndContext<SignatureResult>
  > | null = null;
  let confirmedTx: RpcResponseAndContext<SignatureResult> | null = null;
  let txSendAttempts = 1;
  let signature = '';
  const solanaSigner = await wallet.getSigner()
  // TODO: VersionedTransaction is supported, but the interface needs to be updated
  const tx = await solanaSigner.signTransaction(unsignedTx)
  const serializedTx = tx.serialize();
  const sendOptions = {
    skipPreflight: true,
    maxRetries: 0,
    preFlightCommitment: commitment, // See PR and linked issue for why setting this matters: https://github.com/anza-xyz/agave/pull/483
  };
  signature = await connection.sendRawTransaction(serializedTx, sendOptions);
  confirmTransactionPromise = connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    commitment,
  );

  // This loop will break once the transaction has been confirmed or the block height is exceeded.
  // An exception will be thrown if the block height is exceeded by the confirmTransactionPromise.
  // The transaction will be resent if it hasn't been confirmed after the interval.
  const txRetryInterval = 5000;
  while (!confirmedTx) {
    confirmedTx = await Promise.race([
      confirmTransactionPromise,
      new Promise<null>((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, txRetryInterval),
      ),
    ]);
    if (confirmedTx) {
      break;
    }
    console.log(
      `Tx not confirmed after ${
        txRetryInterval * txSendAttempts++
      }ms, resending`,
    );
    try {
      await connection.sendRawTransaction(serializedTx, sendOptions);
    } catch (e) {
      console.error('Failed to resend transaction:', e);
    }
  }

  if (confirmedTx.value.err) {
    throw new Error(`Transaction failed: ${confirmedTx.value.err}`);
  }

  return signature;
}

// this will throw if the simulation fails
async function createPriorityFeeInstructions(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  commitment?: Commitment,
) {
  let unitsUsed = 200_000;
  let simulationAttempts = 0;

  simulationLoop: while (simulationAttempts < 5) {
    simulationAttempts++;

    if (
      isVersionedTransaction(transaction) &&
      !transaction.message.recentBlockhash
    ) {
      // This is required for versioned transactions - simulateTransaction throws
      // if recentBlockhash is an empty string.
      const { blockhash } = await connection.getLatestBlockhash(commitment);
      transaction.message.recentBlockhash = blockhash;
    }

    const response = await (isVersionedTransaction(transaction)
      ? connection.simulateTransaction(transaction, {
          commitment,
          replaceRecentBlockhash: true,
        })
      : connection.simulateTransaction(transaction));

    if (response.value.err) {
      // In some cases which aren't deterministic, like a slippage error, we can retry the
      // simulation a few times to get a successful response.
      if (response.value.logs) {
        for (const line of response.value.logs) {
          if (line.includes('BlockhashNotFound')) {
            console.info(
              'Blockhash not found during simulation. Trying again.',
            );
            sleep(1000);
            continue simulationLoop;
          } else if (line.includes('SlippageToleranceExceeded')) {
            console.info('Slippage failure during simulation. Trying again.');
            sleep(1000);
            continue simulationLoop;
          }
        }
      }

      // Logs didn't match an error case we would retry; throw
      throw new Error(
        `Simulation failed: ${JSON.stringify(response.value.err)}\nLogs:\n${(
          response.value.logs || []
        ).join('\n  ')}`,
      );
    } else {
      // Success case
      if (response.value.unitsConsumed) {
        unitsUsed = response.value.unitsConsumed;
      }
      break;
    }
  }

  const instructions: TransactionInstruction[] = [];
  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({
      // Set compute budget to 120% of the units used in the simulated transaction
      units: unitsUsed * 1.2,
    }),
  );

  const priorityFee = await determinePriorityFee(connection, transaction, 0.95);
  instructions.push(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }),
  );
  return instructions;
}
