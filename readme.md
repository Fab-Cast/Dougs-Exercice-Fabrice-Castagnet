# Dougs exercice

1- Install packages : `npm install`.

2- Run project : `npm start`.

3- API POST URL : `http://localhost:8080/movements/validation/`.


# Jeu de données

```json
{
    "movements":[    
        {"id":"1", "date":"2019-02-13T08:00:00Z", "label":"Vir reçu XXX", "amount":300},
        {"id":"2", "date":"2021-08-21T14:00:00Z", "label":"Virement loyer", "amount":-1500},
        {"id":"3", "date":"2021-08-21T14:00:00Z", "label":"Vir reçu XXX", "amount":2000},
        {"id":"4", "date":"2021-09-21T14:00:00Z", "label":"Virement loyer", "amount":-1500},
        {"id":"5", "date":"2021-10-05T14:00:00Z", "label":"Virement loyer", "amount":-1500},
        {"id":"6", "date":"2021-10-18T08:00:00Z", "label":"Débit carte No 123", "amount":-200},
        {"id":"7", "date":"2021-10-18T08:00:00Z", "label":"Débit carte No 456", "amount":-50},
        {"id":"8", "date":"2021-10-18T08:00:00Z", "label":"Vir reçu XXX", "amount":2500},
        {"id":"9", "date":"2021-10-25T08:00:00Z", "label":"Chèque XXX", "amount":2500}
    ],
    "balances":[
        {"date":"2019-02-28T23:59:00Z", "balance":"300"},
        {"date":"2020-11-30T23:59:00Z", "balance":"1000"},
        {"date":"2021-06-30T23:59:00Z", "balance":"1000"},
        {"date":"2021-07-31T23:59:00Z", "balance":"-2500"},
        {"date":"2021-08-31T23:59:00Z", "balance":"500"},
        {"date":"2021-09-30T23:59:00Z", "balance":"-1500"},
        {"date":"2021-10-31T23:59:00Z", "balance":"3250"}
    ]
}
```