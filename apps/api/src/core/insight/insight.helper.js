export function getTopCategory(transactions) {

    const map = {};

    for (const tx of transactions) {

        if (tx.type !== "EXPENSE") continue;

        const name = tx.category?.name || "Lainnya";

        map[name] = (map[name] || 0) + tx.amount;

    }

    const result =
        Object.entries(map)
        .sort((a,b)=>b[1]-a[1])[0];

    if(!result) return null;

    return{

        category:result[0],

        amount:result[1]

    };

}

export function getFavoriteWallet(transactions){

    const map={};

    for(const tx of transactions){

        const name=tx.wallet?.name;

        if(!name) continue;

        map[name]=(map[name]||0)+1;

    }

    const result=
        Object.entries(map)
        .sort((a,b)=>b[1]-a[1])[0];

    if(!result) return null;

    return{

        wallet:result[0],

        count:result[1]

    };

}

export function getFavoriteCategory(transactions){

    const map={};

    for(const tx of transactions){

        const name=tx.category?.name;

        if(!name) continue;

        map[name]=(map[name]||0)+1;

    }

    const result=
        Object.entries(map)
        .sort((a,b)=>b[1]-a[1])[0];

    if(!result) return null;

    return{

        category:result[0],

        count:result[1]

    };

}

export function getBusyHour(transactions){

    const map={};

    for(const tx of transactions){

        const hour=new Date(tx.createdAt).getHours();

        map[hour]=(map[hour]||0)+1;

    }

    const result=
        Object.entries(map)
        .sort((a,b)=>b[1]-a[1])[0];

    if(!result) return null;

    return{

        hour:Number(result[0]),

        count:result[1]

    };

}