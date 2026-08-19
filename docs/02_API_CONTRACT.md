# API CONTRACT

Semua response menggunakan format:

{
 success,
 message,
 data
}

Contoh

{
 "success":true,
 "message":"Berhasil",
 "data":{}
}

Error

{
 "success":false,
 "message":"Unauthorized"
}

AUTH

POST

/api/auth/login

POST

/api/auth/register

POST

/api/auth/logout

GET

/api/auth/me

WALLET

GET

/api/wallet

GET

/api/wallet/:id

POST

/api/wallet

PATCH

/api/wallet/:id

DELETE

/api/wallet/:id

TRANSACTION

GET

/api/transaction

GET

/api/transaction/:id

POST

/api/transaction

PATCH

/api/transaction/:id

DELETE

/api/transaction/:id

BUDGET

GET

/api/budget

POST

/api/budget

PATCH

/api/budget/:id

DELETE

/api/budget/:id

REPORT

GET

/api/report/dashboard

GET

/api/report/monthly

GET

/api/report/category

GET

/api/report/wallet

GET

/api/report/cashflow

AI 

POST

/api/ai/chat

GET

/api/ai/history