const express = require('express')
const moment = require('moment')
const router = express.Router()
const { check, validationResult } = require('express-validator')

// On vérifie le format du document.
router.post('/validation', [
    check('movements').not().isEmpty(),
    check("movements.*.id").not().isEmpty().isNumeric(),
    check("movements.*.date").not().isEmpty().isISO8601().toDate(),
    check("movements.*.label").isString(),
    check("movements.*.amount").not().isEmpty().isNumeric().toFloat(),
    check('balances').not().isEmpty(),
    check("balances.*.date").not().isEmpty().isISO8601().toDate(),
    check("balances.*.balance").not().isEmpty().isNumeric().toFloat(),
], (req, res) => {

    // Si il y a des erreurs de format de document, on retourne le code 422
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    // Liste des mois+année unique des movements
    const movementDateList = [...new Set(req.body.movements.map(item => moment(item.date).utc().format('YYYY-MM')))]
    
    // Liste des mois+année unique des balances
    const balanceDateList = [...new Set(req.body.balances.map(item => moment(item.date).utc().format('YYYY-MM')))]

    // Vérification des doublons dans Movements (basé sur l'ID uniquement)
    const duplicateIdMovementsList = getDuplicate(req.body.movements, 'id')
    if (duplicateIdMovementsList.length) {
        return res.status(418).json({ reasons: "Plusieurs 'Movements' ont le même ID", duplicateIdList: duplicateIdMovementsList })
    }

    // Vérification des doublons dans Movements (basé sur tous les champs excepté l'ID)
    const duplicateMovementList = getDuplicateMovementList(req.body.movements)
    if (duplicateMovementList.length) {
        return res.status(418).json({ reasons: "Il y a des doublons dans 'Movements' (même valeurs)", duplicateMovementList: duplicateMovementList })
    }

    // Vérifier qu'une balance existe pour chaque mois/année des movements
    const missingBalancelist = getMissingBalance(req.body.movements, balanceDateList)
    if (missingBalancelist.length) {
        return res.status(418).json({ reasons: "Il manque la balance des mois suivants", balanceDateMissing: missingBalancelist })
    }

    // vérifier s'il y a une écart entre movements et balances pour chaque mois
    const movementDelta = getMovementDelta(req.body, movementDateList)
    if (movementDelta.length) {
        return res.status(418).json({ reasons: "Il y a un écart sur les mois suivants", deltaList: movementDelta })
    }

    res.status(200).send("OK : Aucun écart détecté")

})

function getDuplicate(arr, val) {
    let array = arr
        .map(e => e[val])
        .map((e, i, final) => final.indexOf(e) !== i && i)
        .filter(obj => arr[obj])
        .map(e => arr[e][val])
    return [...new Set(array)]
}

function getDuplicateMovementList(movementList) {
    let doublons = []
    let doublonsString = []
    movementList.forEach((mov) => {
        const {id, ...noIdMov} = mov
        if (doublonsString.includes(JSON.stringify(noIdMov))) {
            let found = doublons.find(d => JSON.stringify(d.movement) === JSON.stringify(noIdMov))
            found.duplicateId.push(mov.id)
        } else {
            doublonsString.push(JSON.stringify(noIdMov))
            doublons.push({ duplicateId: [mov.id], movement: noIdMov })
        }
    })
    return doublons.filter(d => d.duplicateId.length > 1)
}

function getMissingBalance(movementList, balanceDateList) {

    let balanceDateMissing = []
    movementList.forEach((mov) => {
        let movDateString = moment(mov.date).utc().format('YYYY-MM')
        console.log('-----movDateString')
        console.log(movDateString)
        if (balanceDateList.indexOf(movDateString) === -1) {
            balanceDateMissing.push(moment(mov.date).utc().format('YYYY-MM'))
        }
    })
    return [...new Set(balanceDateMissing)]
}

function getMovementDelta(body, movementDateList) {
    
    let deltaList = []
    movementDateList.forEach((movDate) => {

        // Liste des movements du même mois+année
        let sameMovDate = body.movements.filter(mov => {
            return moment(mov.date).utc().format('YYYY-MM') == movDate
        })

        // Somme de toutes les opérations (movement.amount) du même mois
        let sameMovDateSum = sameMovDate.map(item => item.amount).reduce((prev, curr) => prev + curr, 0)

        // récupérer la balance du même mois
        let balance = body.balances.find(bal => moment(bal.date).utc().format('YYYY-MM') === movDate)

        // Si le montant est différent
        if (balance.balance != sameMovDateSum) {
            let delta = sameMovDateSum - balance.balance
            deltaList.push({
                "date": moment(balance.date).utc().format('YYYY-MM'),
                "balance-transactions": sameMovDateSum,
                "balance-releves": balance.balance,
                "delta": delta
            })
        }
    })

    return deltaList
}

module.exports = router