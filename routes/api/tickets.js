const express = require("express");
const router = express.Router();
const db = require("../../config/db");

const { checkToken } = require("../../auth/token_validation");

//SERVER SIDE POST NEW TICKET
router.post("/add-ticket/", checkToken, (req, res) => {
    let sql = `INSERT INTO tickets SET ?`;
    let query = db.query(sql, {
        ticketId: req.body.ticketId,
        ticketInfo: req.body.ticketInfo
    }, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});



//SERVER SIDE GET ALL USER TICKET INFO
router.get("/grab-ticket/:ticketId", checkToken, (req, res) => {
    console.log("req.params.ticketId: " + req.params.ticketId);
    let sql = `SELECT * FROM tickets WHERE ticketId = '${req.params.ticketId}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE GET ALL USER TICKET INFO
router.get("/get-ticket-info/:email", checkToken, (req, res) => {
    let emailWithColons = ":" + req.params.email + ":";
    console.log("emailWithColons: " + emailWithColons);
    let sql = `SELECT * FROM tickets WHERE ticketId LIKE '%${emailWithColons}%'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT TICKET INFO
router.put("/update-ticket/", checkToken, (req, res) => {
    let sql = `UPDATE tickets SET ticketInfo = '${req.body.ticketInfo}' WHERE ticketId = '${req.body.ticketId}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE DELETE TICKET
router.delete("/delete-ticket/:ticketId", checkToken, (req, res) => {
    let sql = `DELETE FROM tickets WHERE ticketId = '${req.params.ticketId}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


module.exports = router;