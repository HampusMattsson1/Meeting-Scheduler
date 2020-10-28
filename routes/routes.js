/**
 * Index
 *
 * @author Hampus Mattsson
 */
"use strict";

const express = require("express");
const router = express.Router();
const exam = require("../src/scheduler_src.js");
const bodyParser = require("body-parser");
const urlencodeParser = bodyParser.urlencoded({"extended": false});


// router.get("/scheme", (req, res) => {
//     // let data = {
//     //     scheme: await exam.viewScheme()
//     // };

//     // let user = req.user.profile.displayName;

//     res.render("scheduler/scheme");
// });


router.get("/schedule_meeting", async (req, res) => {
    // let data = {
    //     scheme: await exam.viewScheme()
    // };

    res.render("scheduler/schedule_meeting");
});





// Gammalt

router.post("/search", urlencodeParser, async (req, res) => {
    console.log(req.body.sokstring);

    let adress = "searchresult/" + req.body.sokstring;

    res.redirect(adress);
});

router.get("/searchresult/:string", async (req, res) => {
    let data = {
        scheme: await exam.searchScheme(req.params.string)
    };

    res.render("exam/searchresult", data);
});

router.get("/searchresult/", async (req, res) => {
    let data = {
        scheme: await exam.viewScheme()
    };

    res.render("exam/visa", data);
});


module.exports = router;
