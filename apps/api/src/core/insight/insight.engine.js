import { getTopCategory, getFavoriteWallet, getFavoriteCategory, getBusyHour } from "./insight.helper.js";

export function buildInsight(transactions){

    return{

        topExpense:getTopCategory(transactions),

        favoriteWallet:getFavoriteWallet(transactions),

        favoriteCategory:getFavoriteCategory(transactions),

        busyHour:getBusyHour(transactions)

    };

}