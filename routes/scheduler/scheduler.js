const express = require('express');
const router  = express.Router();
const session = require('express-session');
const mysql   = require('mysql');
const bcrypt  = require('bcrypt');

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Home Page...
router.get('/', function(req, res) {
    res.render('scheduler/home', {
        title: 'CST 336 - Scheduler App'
    });
    return;
});

router.post('/create_account', function(req, res) {
    // est. connection to database
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
    
    connection.connect();
    
    // validate username - if it exists 
    let username = req.body.username;
    
    let SQLCommand = `SELECT u.username FROM user u WHERE u.username LIKE '${username}'`;
    
    connection.query(SQLCommand, (error, results, fields) => {
        if (error) throw error;
     
        // username exists - account creation failed
        if (results.length != 0) {
             res.json({
                successful: false,
                message: "username taken"
            });
            return;
        }
        
        // username does not exists - hash pswd and store user info. in db table
        let SQLCommand1 = `INSERT INTO user(firstname, lastname, username, password) VALUES (?, ?, ?, ?)`;
        let fname = req.body.fname;
        let lname = req.body.lname;
        let uname = req.body.username;
        let pswd = req.body.password;
        
        bcrypt.hash(pswd, 8, function(err, hash) {
            if (err) throw err;
            connection.query(SQLCommand1, [fname, lname, uname, hash], (error, results, fields) => {
                if (error) throw error;
                
                res.json({
                    successful: true,
                    message: "account created"
                });
                connection.end();
                return;
            });
        });
    }); 
});

router.post('/login', function(req, res) {
    const connection = mysql.createConnection({
        host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user:   'uknqkami7wytp1g5',
    password:   'cwoj4i9atd8hrqpe',
    database:   'xtq5r7cs7joccs4r'
    });
    
    // est. connection to database
    connection.connect();
    
    // validate username - if it exists 
	var username = req.body.username;
	
	let mySQLCommand = `SELECT u.password
                        FROM user u 
                        WHERE u.username LIKE '${username}'`;
	
	connection.query(mySQLCommand, function(error, results, fields) {
	    if (results.length == 0) {
            res.json({
                successful: false,
                message: 'Incorrect Username and/or Password!'
            });
            return;
        }
		
		// compare given pswd to hash using bcrypt
		let actual_pswd = results[0].password;
        let typed_pswd = req.body.password;
        
        bcrypt.compare(typed_pswd, actual_pswd, function(error, result) {
            if (error) throw error;
            
            if(result) {
                req.session.loggedin = true;
                req.session.username = req.body.username;
                res.json({
                    successful: true,
                    message: ""
                });
            } else {
                req.session.loggedin = false;
                delete req.session.username;
                res.json({
                    successful: false,
                    message: "incorrect password"
                });
            } 
        });
	});
	connection.end();
});

router.get('/logout', function(req, res) {
    if (req.session && req.session.username && req.session.username.length) {
        delete req.session.username;
    }

    res.json({
        successful: true,
        message: ''
    });
});

router.get('/dashboard', function(req, res) {
	if (req.session.loggedin) {
	    res.render('scheduler/dashboard', {
              title: 'Dashboard',
            welcome: 'Welcome back, ' + req.session.username + '!'
        });
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

router.get('/dashboard/bussinessAppointments', function(req, res) {
    console.log("In router...");
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
	if (req.session.loggedin) {
	    
	    connection.connect();
	    
	    let mySQLCommand = `SELECT a.*, CONCAT(u.firstname, ' ', u.lastname) AS fullName 
                            FROM appointment a INNER JOIN
                            user u ON a.userID = u.userID
                            WHERE u.username LIKE '${req.session.username}'`;
	    
        connection.query(mySQLCommand, function(error, results, fields) {
            if (error) throw error;
    	    if (results.length == 0) {
                res.json({
                    successful: false,
                    message: 'No appointments found.'
                });
                connection.end();
                return;
            }
            res.json({
                successful: true,
                appointment: results
            });
    
            connection.end();
    		return;
    	});
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

router.post('/findAppointments', function(req, res) {
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
	    
    connection.connect();
    
    let mySQLCommand = `SELECT a.*, CONCAT(u.firstname, ' ', u.lastname) AS fullName 
                        FROM appointment a INNER JOIN
                        user u ON a.userID = u.userID
                        WHERE a.date LIKE '${req.body.date}'`;
    
    connection.query(mySQLCommand, function(error, results, fields) {
        if (error) throw error;
	    if (results.length == 0) {
            res.json({
                successful: false,
                message: 'No appointments found.'
            });
            connection.end();
            return;
        }
        res.json({
            successful: true,
            appointment: results
        });

        connection.end();
		return;
	});

});

router.post('/dashboard/bussinessAppointments/details', function(req, res) {
    console.log("details...");
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
    
	if (req.session.loggedin) {
	    
	    connection.connect();
	    
	    let mySQLCommand = `SELECT a.*
                            FROM appointment a
                            WHERE a.appointmentID LIKE '${req.body.appointmentID}'`;
	    
        connection.query(mySQLCommand, function(error, results, fields) {
            if (error) throw error;
            
            res.json({
                appointment: results
            });
    
            connection.end();
    		return;
    	});
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

router.post('/dashboard/add_appointment', function(req, res) {
    console.log("In add router...");
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
    
	if (req.session.loggedin) {
	    let date = req.body.date;
	    console.log("Date:", date);
	    let startTime = req.body.startTime;
	    console.log("Start Time:", startTime);
	    let endTime = req.body.endTime;
	    let bookedBy = "Not Booked";
	    var userID;
	    
	    
	    connection.connect();
	    
	    let mySQLCommand = `SELECT u.userID FROM user u WHERE u.username LIKE '${req.session.username}'`;
    
        connection.query(mySQLCommand, (error, results, fields) => {
            if (error) throw error;
            
            userID = results[0].userID;
            
            mySQLCommand = `INSERT INTO appointment(userID, bookedBy, date, startTime, endTime) VALUES (?, ?, ?, ?, ?)`;
            
            connection.query(mySQLCommand, [userID, bookedBy, date, startTime, endTime], function(error, results, fields) {
                if (error) throw error;
        	    
                res.json({
                    successful: true,
                });
        
                connection.end();
        		return;
        	});
            
            
        });
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

router.post('/dashboard/delete_appointment', function(req, res) {
    console.log("In delete router...");
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
    
	if (req.session.loggedin) {
	    let appointmentID = req.body.appointmentID;
	    
	    connection.connect();
    
        connection.query(`DELETE a.* FROM appointment a WHERE a.appointmentID = ?`, [appointmentID], (error, results, fields) => {
            if (error) throw error;
            
            res.json({
                successful: true,
            });
    
            connection.end();
    		return;
            
        });
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

router.post('/dashboard/delete-confirmation', function(req, res) {
    const connection = mysql.createConnection({
            host:   'thzz882efnak0xod.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user:   'uknqkami7wytp1g5',
        password:   'cwoj4i9atd8hrqpe',
        database:   'xtq5r7cs7joccs4r'
    });
    
	if (req.session.loggedin) {
	    
	    connection.connect();
	    
	    let mySQLCommand = `SELECT a.*
                            FROM appointment a
                            WHERE a.appointmentID LIKE '${req.body.appointmentID}'`;
	    
        connection.query(mySQLCommand, function(error, results, fields) {
            if (error) throw error;
            
            res.json({
                appointment: results,
                successful: true
            });
    
            connection.end();
    		return;
    	});
	} else {
	    delete req.session.username;
        res.redirect('/scheduler/');
	}
});

module.exports = router;