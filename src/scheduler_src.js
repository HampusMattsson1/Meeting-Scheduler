/**
 * Teachers
 *
 * @author Hampus Mattsson
 */
"use strict";

const config = require("../config/db/scheduler.json");
const mysql = require("promise-mysql");
let db;

(async function() {
    db = await mysql.createConnection(config);

    process.on("exit", () => {
        db.end();
    });
})();

require("date-format-lite");


// For login
async function addUser(email, user) {
    let sql = `
    INSERT IGNORE INTO users (email, user_name)
    VALUES (?, ?);
    `;

    let res = await db.query(sql, [email, user]);

    return res[0];
}

// To create a meeting
async function createMeeting(start_user, sdate, edate, text, v_meeting) {
    let sql = `
    INSERT INTO meetings (start_user, start_date, end_date, text, v_meeting)
    VALUES (?,?,?,?,?);
    `;

    let res = await db.query(sql, [start_user,sdate,edate,text,v_meeting]);

    return res[0];
}

// For calendar
async function viewScheme(user) {
    let sql = `
    SELECT
        m.start_user AS start_user,
        m.start_date AS start_date,
        m.end_date AS end_date,
        m.text as text
    FROM meetings AS m
        LEFT OUTER JOIN meeting_users AS ms
            ON m.id = ms.meeting_id
    WHERE start_user = ? OR ms.user_email = ?
    group by m.id
    ORDER BY m.id ASC;
    `;

    let result = await db.query(sql, [user, user]);
    let result2 = [];

    result.forEach((entry) => {
        // format date and time
        if (entry.start_date != null) {
        result2.push(entry);
        // entry.start_date = entry.start_date;
        // entry.end_date = entry.end_date;
        }
        // console.log(result2);
    });
    return result2;
}

// See meetings
async function getMeetings(user) {
    let sql = `
    SELECT
        m.id AS id,
        m.start_user AS start_user,
        DATE_FORMAT(m.start_date, "%e/%m %H:%i") as start_date,
        DATE_FORMAT(m.end_date, "%e/%m %H:%i") as end_date,
        m.text as text,
        m.v_meeting as v_meeting
    FROM meetings AS m
        LEFT OUTER JOIN meeting_users AS ms
            ON m.id = ms.meeting_id
    WHERE start_user = ? OR ms.user_email = ?
    GROUP BY m.id, ms.meeting_id
    ORDER BY m.id DESC;
    `;

    let res = await db.query(sql, [user,user]);

    return res;
}


// Get invite
async function viewMeeting(id) {
    let sql = `
    SELECT
    id,
    start_user,
    DATE_FORMAT(start_date, "%e/%m %H:%i") as start_date,
    DATE_FORMAT(end_date, "%e/%m %H:%i") as end_date,
    text,
    v_meeting
    FROM meetings
    WHERE ID = ?
    `;

    let res = await db.query(sql, [id]);

    return res[0];
}


async function viewNewVmeeting(user) {
    let sql = `
    SELECT * FROM meetings
    WHERE start_user = ?
    GROUP BY id
    ORDER BY ID desc
    LIMIT 1
    ;
    `;

    let res = await db.query(sql, [user]);

    return res[0];
}


async function addMeetingTime(meeting_id, start_date, end_date) {
    let sql = `
    INSERT INTO voting_times (meeting_id, start_date, end_date)
    VALUES (?,?,?);
    `;

    let res = await db.query(sql, [meeting_id,start_date,end_date]);

    return res[0];
}


async function getMeetingTimes(id) {
    let sql = `
    SELECT 
    meeting_id,
    COUNT(meeting_id) AS times
    FROM voting_times
    WHERE meeting_id = ?
    limit 1
    ;
    `;

    let res = await db.query(sql, [id]);

    return res[0];
}


async function votePool(id) {
    let sql = `
    SELECT
        vt.meeting_id as meeting_id,
        vt.id as id,
        DATE_FORMAT(vt.start_date, "%e/%m %T") as start_date,
        DATE_FORMAT(vt.end_date, "%e/%m %T") as end_date,
        COUNT(v.vote_time_id) AS votes
    FROM voting_times AS vt
        LEFT OUTER JOIN votes AS v
            ON v.vote_time_id = vt.id
    WHERE vt.meeting_id = ?
    GROUP BY vt.start_date
    ORDER BY vt.start_date ASC;
    `;

    let res = await db.query(sql, [id]);

    return res;
}


async function addVote(meeting_id, id, name) {
    let sql = `
    INSERT INTO votes (meeting_id, vote_time_id, vote_user)
    VALUES (?,?,?);
    `;

    let res = await db.query(sql, [meeting_id,id,name]);

    return res[0];
}


async function voteCheck(vote_id, name) {
    let sql = `
    SELECT * FROM votes
    WHERE vote_time_id = ? AND vote_user = ?;
    `;

    let res = await db.query(sql, [vote_id,name]);

    return res[0];
}


async function getTimes(id, meeting_id) {
    let sql = `
    SELECT * FROM voting_times
    WHERE id = ? AND meeting_id = ?;
    `;

    let res = await db.query(sql, [id,meeting_id]);

    return res[0];
}


async function finalTime(meeting_id, start_date, end_date) {
    let sql = `
    UPDATE meetings
    SET
        start_date = ?,
        end_date = ?,
        v_meeting = "0"
    WHERE
        id = ?;
    `;

    let res = await db.query(sql, [start_date,end_date,meeting_id]);

    return res[0];
}


async function saveMeetingEdit(meeting_id, start_user, start_date, end_date, text) {
    let sql = `
    UPDATE meetings
    SET
        start_user = ?,
        start_date = ?,
        end_date = ?,
        text = ?
    WHERE
        id = ?;
    `;

    let res = await db.query(sql, [start_user, start_date, end_date, text, meeting_id]);

    return res[0];
}


async function deleteMeeting(meeting_id) {
    let sql = `
    DELETE FROM meetings WHERE id = ?
    ;
    DELETE FROM meeting_users WHERE meeting_id = ?
    ;
    DELETE FROM voting_times WHERE meeting_id = ?
    ;
    DELETE FROM votes WHERE meeting_id = ?
    ;
    `;

    let res = await db.query(sql, [meeting_id, meeting_id,meeting_id, meeting_id]);

    return res[0];
}


async function checkOwner(id, name) {
    let sql = `
    SELECT * FROM meetings
    WHERE id = ? AND start_user = ?;
    `;

    let res = await db.query(sql, [id,name]);

    return res;
}


async function editViewMeeting(id) {
    let sql = `
    SELECT
    start_user,
    DATE_FORMAT(start_date, "%Y-%c-%e %H:%i") as start_date,
    DATE_FORMAT(end_date, "%Y-%c-%e %H:%i") as end_date,
    text,
    v_meeting
    FROM meetings
    WHERE id = ?
    ;
    `;

    let res = await db.query(sql, [id]);

    return res[0];
}


async function joinMeeting(id,user) {
    let sql = `
    INSERT IGNORE INTO meeting_users (meeting_id, user_email)
    VALUES (?, ?);
    `;

    let res = await db.query(sql, [id,user]);

    return res[0];
}




module.exports = {
    "addUser": addUser,
    "createMeeting": createMeeting,
    "viewScheme": viewScheme,
    "getMeetings": getMeetings,
    "viewMeeting": viewMeeting,
    "viewNewVmeeting": viewNewVmeeting,
    "addMeetingTime": addMeetingTime,
    "getMeetingTimes": getMeetingTimes,
    "votePool": votePool,
    "addVote": addVote,
    "voteCheck": voteCheck,
    "getTimes": getTimes,
    "finalTime": finalTime,
    "saveMeetingEdit": saveMeetingEdit,
    "deleteMeeting": deleteMeeting,
    "checkOwner": checkOwner,
    "editViewMeeting": editViewMeeting,
    "joinMeeting": joinMeeting
};
