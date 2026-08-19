import { transactionHandler } from "./transaction.handler.js";
import { balanceHandler } from "./balance.handler.js";
import { reportHandler } from "./report.handler.js";
import { budgetHandler } from "./budget.handler.js";
import { helpHandler } from "./help.handler.js";
import { unknownHandler } from "./unknown.handler.js";
import { historyHandler } from "./history.handler.js";
import { walletHandler } from "./wallet.handler.js";
import { undoHandler } from "./undo.handler.js";
import { editHandler } from "./edit.handler.js";
import { deleteHandler } from "./delete.handler.js";
import { receiptHandler } from "./receipt.handler.js";
import { voiceHandler } from "./voice.handler.js";
import { exportHandler } from "./export.handler.js";
import { aiHandler } from "./ai.handler.js";

export const CREATE_TRANSACTION = transactionHandler;

export const GET_BALANCE = balanceHandler;
export const GET_WALLET = walletHandler;
export const SET_WALLET = walletHandler;
export const UPDATE_WALLET = walletHandler;
export const TRANSFER_WALLET = walletHandler;

export const GET_REPORT = reportHandler;
export const GET_REPORT_TODAY = reportHandler;
export const GET_REPORT_WEEK = reportHandler;
export const GET_REPORT_MONTH = reportHandler;

export const SET_BUDGET = budgetHandler;
export const GET_BUDGET = budgetHandler;

export const GET_HISTORY = historyHandler;

export const HELP = helpHandler;
export const UNDO = undoHandler;
export const EDIT_TRANSACTION = editHandler;
export const DELETE_TRANSACTION = deleteHandler;
export const RECEIPT_SCAN = receiptHandler;
export const VOICE_INPUT = voiceHandler;
export const EXPORT = exportHandler;
export const ASK_AI = aiHandler;
export const UNKNOWN = unknownHandler;

export { receiptHandler, voiceHandler, exportHandler, aiHandler };

